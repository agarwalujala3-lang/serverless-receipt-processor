import csv
import json
import os
import re
import uuid
from collections import defaultdict
from decimal import Decimal
from datetime import datetime, timezone
from io import StringIO
import time

import boto3
from botocore.exceptions import ClientError


s3 = boto3.client("s3")
dynamodb = boto3.resource("dynamodb")
RECEIPT_TABLE = os.environ.get("DYNAMODB_TABLE", "ReceiptRecords")
RECEIPT_BUCKET = os.environ.get("RECEIPT_BUCKET", "")
CACHE_TTL_SECONDS = int(os.environ.get("SNAPSHOT_CACHE_TTL_SECONDS", "15"))
UPLOAD_URL_EXPIRES_IN = int(os.environ.get("UPLOAD_URL_EXPIRES_IN", "900"))
_SNAPSHOT_CACHE = {"expires_at": 0.0, "payload": None}


def lambda_handler(event, context):
    if event.get("warmer") or event.get("source") == "aws.events":
        get_snapshot_payload(force_refresh=True)
        return response(200, {"status": "warm"})

    method = (
        event.get("requestContext", {}).get("http", {}).get("method")
        or event.get("httpMethod", "GET")
    ).upper()
    path = (event.get("rawPath") or event.get("path") or "/").rstrip("/") or "/"

    try:
        if method == "OPTIONS":
            return response(200, {"status": "ok"})
        if method == "GET" and path == "/":
            return response(
                200,
                {
                    "service": "ReceiptPulse API",
                    "status": "ok",
                    "routes": [
                        "/health",
                        "/snapshot",
                        "/receipts",
                        "/receipts/clear",
                        "/analytics",
                        "/uploads",
                        "/uploads/status",
                        "/exports/csv",
                    ],
                },
            )
        if method == "GET" and path == "/health":
            return response(200, {"status": "ok"})
        if method == "POST" and path == "/uploads":
            body = json.loads(event.get("body") or "{}")
            return response(200, create_upload_session(body))
        if method == "GET" and path == "/uploads/status":
            query_params = event.get("queryStringParameters") or {}
            return response(200, get_upload_status(query_params.get("key")))
        if method == "GET" and path == "/receipts":
            snapshot = get_snapshot_payload()
            receipts = filter_receipts(
                snapshot["receipts"], event.get("queryStringParameters") or {}
            )
            return response(200, {"receipts": receipts})
        if method == "GET" and path == "/analytics":
            analytics = get_snapshot_payload()["analytics"]
            return response(200, analytics)
        if method == "GET" and path == "/snapshot":
            return response(200, get_snapshot_payload())
        if method == "POST" and path == "/receipts/clear":
            body = json.loads(event.get("body") or "{}")
            deleted = clear_receipts(body)
            return response(200, deleted)
        if method == "GET" and path == "/exports/csv":
            csv_text = export_csv(get_snapshot_payload()["receipts"])
            return response(200, csv_text, content_type="text/csv")
        if method == "PATCH" and path.startswith("/receipts/") and path.endswith("/review"):
            receipt_id = path.split("/")[2]
            body = json.loads(event.get("body") or "{}")
            updated = update_review_status(receipt_id, body)
            return response(200, updated)
    except Exception as exc:
        return response(500, {"message": str(exc)})

    return response(404, {"message": "Route not found."})


def scan_receipts():
    table = dynamodb.Table(RECEIPT_TABLE)
    items = []
    scan_args = {
        "ProjectionExpression": (
            "receipt_id, vendor, category, review_status, total_amount, "
            "confidence_score, expense_month, uploaded_by, receipt_label, s3_path, "
            "processed_timestamp, is_duplicate, review_reasons, file_name, "
            "currency_symbol, duplicate_of, item_count, #receipt_key"
        ),
        "ExpressionAttributeNames": {"#receipt_key": "key"},
    }
    response = table.scan(**scan_args)
    items.extend(response.get("Items", []))

    while "LastEvaluatedKey" in response:
        response = table.scan(
            ExclusiveStartKey=response["LastEvaluatedKey"],
            **scan_args,
        )
        items.extend(response.get("Items", []))

    items.sort(key=lambda item: item.get("processed_timestamp", ""), reverse=True)
    return items


def get_snapshot_payload(force_refresh=False):
    now = time.time()
    if (
        not force_refresh
        and _SNAPSHOT_CACHE["payload"] is not None
        and _SNAPSHOT_CACHE["expires_at"] > now
    ):
        return _SNAPSHOT_CACHE["payload"]

    receipts = scan_receipts()
    payload = {
        "receipts": receipts,
        "analytics": build_analytics(receipts),
        "generatedAt": datetime.now(timezone.utc).isoformat(),
    }
    _SNAPSHOT_CACHE["payload"] = payload
    _SNAPSHOT_CACHE["expires_at"] = now + CACHE_TTL_SECONDS
    return payload


def create_upload_session(payload):
    if not RECEIPT_BUCKET:
        raise ValueError("Receipt bucket is not configured for uploads.")

    file_name = sanitize_filename(payload.get("fileName") or "receipt-upload")
    content_type = payload.get("contentType") or "application/octet-stream"
    uploader_email = (payload.get("uploaderEmail") or "ops@receiptpulse.dev").strip()
    receipt_label = (
        payload.get("receiptLabel")
        or payload.get("uploaderName")
        or ""
    ).strip()
    stamp = datetime.now(timezone.utc).strftime("%Y/%m/%d")
    object_key = f"incoming/{stamp}/{uuid.uuid4().hex[:12]}-{file_name}"
    metadata = {
        "uploader-email": uploader_email[:120],
        "uploader-name": receipt_label[:120],
        "receipt-label": receipt_label[:120],
    }

    upload_url = s3.generate_presigned_url(
        "put_object",
        Params={
            "Bucket": RECEIPT_BUCKET,
            "Key": object_key,
            "ContentType": content_type,
            "Metadata": metadata,
        },
        ExpiresIn=UPLOAD_URL_EXPIRES_IN,
    )

    return {
        "uploadUrl": upload_url,
        "objectKey": object_key,
        "s3Path": f"s3://{RECEIPT_BUCKET}/{object_key}",
        "expiresIn": UPLOAD_URL_EXPIRES_IN,
        "headers": {
            "Content-Type": content_type,
            "x-amz-meta-uploader-email": metadata["uploader-email"],
            "x-amz-meta-uploader-name": metadata["uploader-name"],
            "x-amz-meta-receipt-label": metadata["receipt-label"],
        },
        "pollAfterMs": 2200,
    }


def get_upload_status(object_key):
    receipt = find_receipt_by_key(object_key, force_refresh=True)
    if receipt:
        return {
            "status": "PROCESSED",
            "stage": "stored",
            "receipt": serialize_receipt(receipt),
            "message": "Receipt processed and available in the operations console.",
        }

    if not object_key:
        return {
            "status": "INVALID",
            "stage": "intake",
            "message": "Upload key is missing.",
        }

    try:
        head = s3.head_object(Bucket=RECEIPT_BUCKET, Key=object_key)
    except ClientError as exc:
        error_code = exc.response.get("Error", {}).get("Code", "")
        if error_code in {"404", "NotFound", "NoSuchKey"}:
            return {
                "status": "NOT_FOUND",
                "stage": "intake",
                "message": "Receipt file was not found in storage.",
            }
        raise

    return {
        "status": "PROCESSING",
        "stage": "textract",
        "objectKey": object_key,
        "lastModified": head.get("LastModified", datetime.now(timezone.utc)).astimezone(
            timezone.utc
        ).isoformat(),
        "message": "Receipt uploaded. AI extraction and rule checks are running now.",
    }


def find_receipt_by_key(object_key, force_refresh=False):
    if not object_key:
        return None

    snapshot = get_snapshot_payload(force_refresh=force_refresh)
    for receipt in snapshot["receipts"]:
        if receipt.get("key") == object_key:
            return receipt
    return None


def filter_receipts(receipts, query_params):
    status = (query_params.get("status") or "").lower()
    category = (query_params.get("category") or "").lower()
    vendor = (query_params.get("vendor") or "").lower()
    month = query_params.get("month") or ""

    filtered = []
    for receipt in receipts:
        if status and receipt.get("review_status", "").lower() != status:
            continue
        if category and receipt.get("category", "").lower() != category:
            continue
        if vendor and vendor not in receipt.get("vendor", "").lower():
            continue
        if month and receipt.get("expense_month") != month:
            continue
        filtered.append(receipt)

    return filtered


def build_analytics(receipts):
    total_spend = 0.0
    confidence_values = []
    category_totals = defaultdict(float)
    vendor_totals = defaultdict(float)
    month_totals = defaultdict(lambda: {"amount": 0.0, "count": 0})
    status_totals = defaultdict(int)
    review_queue = []

    for receipt in receipts:
        amount = parse_float(receipt.get("total_amount"))
        confidence = parse_float(receipt.get("confidence_score"))
        category = receipt.get("category", "Uncategorized")
        vendor = receipt.get("vendor", "Unknown Vendor")
        month = receipt.get("expense_month", "unknown")
        status = receipt.get("review_status", "UNKNOWN")

        total_spend += amount
        if confidence:
            confidence_values.append(confidence)
        category_totals[category] += amount
        vendor_totals[vendor] += amount
        month_totals[month]["amount"] += amount
        month_totals[month]["count"] += 1
        status_totals[status] += 1

        if status in ("NEEDS_REVIEW", "DUPLICATE"):
            review_queue.append(
                {
                    "receiptId": receipt.get("receipt_id"),
                    "vendor": vendor,
                    "category": category,
                    "receiptLabel": receipt.get("receipt_label", ""),
                    "totalAmount": receipt.get("total_amount", "0.00"),
                    "reviewStatus": status,
                    "reasons": receipt.get("review_reasons", []),
                }
            )

    average_confidence = (
        sum(confidence_values) / len(confidence_values) if confidence_values else 0.0
    )
    duplicate_count = sum(1 for receipt in receipts if receipt.get("is_duplicate"))

    return {
        "summary": {
            "receiptCount": len(receipts),
            "totalSpend": round(total_spend, 2),
            "averageConfidence": round(average_confidence, 2),
            "duplicateCount": duplicate_count,
            "needsReviewCount": status_totals.get("NEEDS_REVIEW", 0)
            + status_totals.get("DUPLICATE", 0),
            "autoApprovedCount": status_totals.get("AUTO_APPROVED", 0),
        },
        "categoryBreakdown": sort_breakdown(category_totals),
        "topVendors": sort_breakdown(vendor_totals, key_name="vendor"),
        "statusBreakdown": [
            {"status": status, "count": count}
            for status, count in sorted(status_totals.items(), key=lambda item: item[0])
        ],
        "monthlyTrend": [
            {
                "month": month,
                "amount": round(values["amount"], 2),
                "count": values["count"],
            }
            for month, values in sorted(month_totals.items(), key=lambda item: item[0])
        ],
        "reviewQueue": review_queue[:6],
    }


def export_csv(receipts):
    buffer = StringIO()
    writer = csv.DictWriter(
        buffer,
        fieldnames=[
            "receipt_id",
            "vendor",
            "category",
            "review_status",
            "total_amount",
            "confidence_score",
            "expense_month",
            "uploaded_by",
            "receipt_label",
            "s3_path",
        ],
    )
    writer.writeheader()
    for receipt in receipts:
        writer.writerow(
            {
                "receipt_id": receipt.get("receipt_id"),
                "vendor": receipt.get("vendor"),
                "category": receipt.get("category"),
                "review_status": receipt.get("review_status"),
                "total_amount": receipt.get("total_amount"),
                "confidence_score": receipt.get("confidence_score"),
                "expense_month": receipt.get("expense_month"),
                "uploaded_by": receipt.get("uploaded_by"),
                "receipt_label": receipt.get("receipt_label"),
                "s3_path": receipt.get("s3_path"),
            }
        )
    return buffer.getvalue()


def update_review_status(receipt_id, payload):
    table = dynamodb.Table(RECEIPT_TABLE)
    review_status = payload.get("reviewStatus", "REVIEWED")
    reviewer = payload.get("reviewer", "ops-console")
    note = payload.get("note", "")
    reviewed_at = datetime.now(timezone.utc).isoformat()

    response = table.update_item(
        Key={"receipt_id": receipt_id},
        UpdateExpression=(
            "SET review_status = :status, reviewed_by = :reviewed_by, "
            "reviewed_at = :reviewed_at, reviewer_note = :reviewer_note"
        ),
        ExpressionAttributeValues={
            ":status": review_status,
            ":reviewed_by": reviewer,
            ":reviewed_at": reviewed_at,
            ":reviewer_note": note,
        },
        ReturnValues="ALL_NEW",
    )
    invalidate_snapshot_cache()
    return {"receipt": response.get("Attributes", {})}


def clear_receipts(payload):
    from_date = payload.get("fromDate") or ""
    to_date = payload.get("toDate") or ""
    matching_receipts = [
        receipt
        for receipt in scan_receipts()
        if receipt_matches_range(receipt, from_date, to_date)
    ]

    if not matching_receipts:
        return {
            "deletedCount": 0,
            "deletedS3Objects": 0,
            "fromDate": from_date or None,
            "toDate": to_date or None,
            "message": "No stored receipts matched the selected time period.",
        }

    table = dynamodb.Table(RECEIPT_TABLE)
    deleted_objects = 0

    with table.batch_writer() as batch:
        for receipt in matching_receipts:
            batch.delete_item(Key={"receipt_id": receipt["receipt_id"]})
            key = receipt.get("key")
            if RECEIPT_BUCKET and key:
                try:
                    s3.delete_object(Bucket=RECEIPT_BUCKET, Key=key)
                    deleted_objects += 1
                except ClientError:
                    pass

    invalidate_snapshot_cache()
    return {
        "deletedCount": len(matching_receipts),
        "deletedS3Objects": deleted_objects,
        "fromDate": from_date or None,
        "toDate": to_date or None,
        "message": f"Deleted {len(matching_receipts)} stored receipts for the selected period.",
    }


def invalidate_snapshot_cache():
    _SNAPSHOT_CACHE["payload"] = None
    _SNAPSHOT_CACHE["expires_at"] = 0.0


def serialize_receipt(receipt):
    return {
        "receiptId": receipt.get("receipt_id"),
        "vendor": receipt.get("vendor", "Unknown Vendor"),
        "category": receipt.get("category", "Uncategorized"),
        "reviewStatus": receipt.get("review_status", "UNKNOWN"),
        "totalAmount": receipt.get("total_amount", "0.00"),
        "confidenceScore": receipt.get("confidence_score", "0.00"),
        "expenseMonth": receipt.get("expense_month"),
        "uploadedBy": receipt.get("uploaded_by"),
        "receiptLabel": receipt.get("receipt_label", ""),
        "s3Path": receipt.get("s3_path"),
        "processedAt": receipt.get("processed_timestamp"),
        "fileName": receipt.get("file_name"),
        "objectKey": receipt.get("key"),
        "currencySymbol": receipt.get("currency_symbol", "$"),
        "duplicateOf": receipt.get("duplicate_of"),
        "itemCount": receipt.get("item_count", 0),
        "reviewReasons": receipt.get("review_reasons", []),
    }


def sort_breakdown(values, key_name="label"):
    total = sum(values.values()) or 1
    rows = []
    for label, amount in sorted(values.items(), key=lambda item: item[1], reverse=True):
        rows.append(
            {
                key_name: label,
                "amount": round(amount, 2),
                "share": round((amount / total) * 100, 1),
            }
        )
    return rows


def parse_float(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def sanitize_filename(value):
    basename = os.path.basename(str(value).strip())
    sanitized = re.sub(r"[^A-Za-z0-9._-]+", "-", basename).strip(".-")
    return sanitized or "receipt-upload"


def receipt_matches_range(receipt, from_date, to_date):
    stamp = parse_receipt_timestamp(receipt)
    if stamp is None:
        return not from_date and not to_date

    if from_date:
        start = datetime.fromisoformat(f"{from_date}T00:00:00+00:00")
        if stamp < start:
            return False

    if to_date:
        end = datetime.fromisoformat(f"{to_date}T23:59:59.999999+00:00")
        if stamp > end:
            return False

    return True


def parse_receipt_timestamp(receipt):
    candidates = [
        receipt.get("processed_timestamp"),
        receipt.get("created_at"),
        receipt.get("date"),
    ]
    for candidate in candidates:
        if not candidate:
            continue
        if len(candidate) == 10:
            candidate = f"{candidate}T00:00:00+00:00"
        normalized = str(candidate).replace("Z", "+00:00")
        try:
            stamp = datetime.fromisoformat(normalized)
            if stamp.tzinfo is None:
                stamp = stamp.replace(tzinfo=timezone.utc)
            return stamp.astimezone(timezone.utc)
        except ValueError:
            continue
    return None


def response(status_code, payload, content_type="application/json"):
    body = payload if isinstance(payload, str) else json.dumps(normalize_payload(payload))
    cache_control = "no-store"
    if content_type == "application/json" and status_code == 200:
        cache_control = "public, max-age=10, stale-while-revalidate=20"
    return {
        "statusCode": status_code,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
            "Content-Type": content_type,
            "Cache-Control": cache_control,
        },
        "body": body,
    }


def normalize_payload(value):
    if isinstance(value, list):
        return [normalize_payload(item) for item in value]
    if isinstance(value, dict):
        return {key: normalize_payload(item) for key, item in value.items()}
    if isinstance(value, Decimal):
        if value % 1 == 0:
            return int(value)
        return float(value)
    return value
