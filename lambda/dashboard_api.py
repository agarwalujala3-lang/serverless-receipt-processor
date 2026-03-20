import csv
import json
import os
from collections import defaultdict
from datetime import datetime, timezone
from io import StringIO

import boto3


dynamodb = boto3.resource("dynamodb")
RECEIPT_TABLE = os.environ.get("DYNAMODB_TABLE", "ReceiptRecords")


def lambda_handler(event, context):
    method = (
        event.get("requestContext", {}).get("http", {}).get("method")
        or event.get("httpMethod", "GET")
    ).upper()
    path = (event.get("rawPath") or event.get("path") or "/").rstrip("/") or "/"

    try:
        if method == "OPTIONS":
            return response(200, {"status": "ok"})
        if method == "GET" and path == "/health":
            return response(200, {"status": "ok"})
        if method == "GET" and path == "/receipts":
            receipts = filter_receipts(scan_receipts(), event.get("queryStringParameters") or {})
            return response(200, {"receipts": receipts})
        if method == "GET" and path == "/analytics":
            analytics = build_analytics(scan_receipts())
            return response(200, analytics)
        if method == "GET" and path == "/exports/csv":
            csv_text = export_csv(scan_receipts())
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
    response = table.scan()
    items.extend(response.get("Items", []))

    while "LastEvaluatedKey" in response:
        response = table.scan(ExclusiveStartKey=response["LastEvaluatedKey"])
        items.extend(response.get("Items", []))

    items.sort(key=lambda item: item.get("processed_timestamp", ""), reverse=True)
    return items


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
    return {"receipt": response.get("Attributes", {})}


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


def response(status_code, payload, content_type="application/json"):
    body = payload if isinstance(payload, str) else json.dumps(payload)
    return {
        "statusCode": status_code,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
            "Content-Type": content_type,
        },
        "body": body,
    }
