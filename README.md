# ReceiptPulse

ReceiptPulse is a **serverless receipt intelligence platform** built on AWS. It turns uploaded receipt files into structured expense records, flags risky submissions for review, detects possible duplicates, stores analytics-ready data in DynamoDB, and exposes a lightweight review API plus an eye-catching dashboard experience for demos and portfolio use.

## Why This Version Feels Stronger

The original project proved that S3, Lambda, Textract, DynamoDB, and SES could work together.

This upgraded version pushes the idea further into a product-shaped system:

- receipt categorization for richer expense insights
- confidence-based review routing
- duplicate detection before finance teams double-book receipts
- uploader-aware notifications
- analytics and export endpoints
- a polished dashboard UI for non-technical and technical audiences
- deployable infrastructure in a SAM template

## Architecture

### Core Processing Pipeline

1. A receipt lands in **Amazon S3**
2. An S3 event triggers **AWS Lambda**
3. Lambda uses **Amazon Textract AnalyzeExpense**
4. The processor enriches the result with:
   - category
   - duplicate key
   - confidence score
   - review status
   - analytics fields
5. The structured document is stored in **Amazon DynamoDB**
6. **Amazon SES** sends a processing notification
7. A separate API Lambda exposes receipts, analytics, CSV export, and review actions

### Services Used

- **Amazon S3** for receipt intake
- **AWS Lambda** for event-driven processing and review APIs
- **Amazon Textract** for receipt extraction
- **Amazon DynamoDB** for enriched receipt storage
- **Amazon SES** for notification emails
- **Amazon API Gateway / HTTP API** for analytics and review access
- **Amazon SQS** dead-letter queue for resiliency
- **IAM** for scoped service permissions

## What Is New

### Receipt Intelligence

- vendor, date, total, line items, and file metadata are stored together
- category inference based on vendor and item keywords
- confidence score derived from Textract field confidence
- review routing when key fields are missing or confidence is low
- duplicate detection using a hashed receipt signature

### Operations Layer

- `GET /health`
- `GET /receipts`
- `GET /analytics`
- `GET /exports/csv`
- `PATCH /receipts/{receiptId}/review`

### Dashboard Experience

The `dashboard/` folder includes a premium static UI called **ReceiptPulse Console**.

It is built to impress both:

- **non-technical viewers**
  - polished hero section
  - category spend visuals
  - review queue storytelling
  - clean architecture flow

- **technical reviewers**
  - analytics-ready data model
  - review-state logic
  - API-driven structure
  - deployable infrastructure definition

The dashboard works with the included demo dataset by default and can be pointed at a live API using:

```text
dashboard/index.html?api=https://your-api-base-url
```

## Repository Structure

```text
.
├── dashboard/
│   ├── app.js
│   ├── index.html
│   ├── styles.css
│   └── data/demo-dashboard.json
├── events/
│   ├── sample_review_event.json
│   └── sample_s3_event.json
├── lambda/
│   ├── dashboard_api.py
│   └── lambda_function.py
├── sample-receipts/
├── screenshots/
├── template.yaml
└── README.md
```

## Lambda Highlights

### `lambda/lambda_function.py`

- processes one or many S3 event records
- calls Textract `AnalyzeExpense`
- normalizes dates and amounts
- infers receipt category
- calculates confidence score
- flags low-confidence receipts for review
- detects duplicates
- writes enriched records to DynamoDB
- sends SES updates to the uploader or fallback recipient

### `lambda/dashboard_api.py`

- lists receipt records
- builds analytics summaries
- exports CSV
- supports manual review updates

## Example Enriched Receipt Record

```json
{
  "receipt_id": "rcpt-118",
  "vendor": "SkyRoute Travels",
  "category": "Travel",
  "total_amount": "384.50",
  "confidence_score": "96.20",
  "review_status": "AUTO_APPROVED",
  "expense_month": "2026-03",
  "uploaded_by": "finance@receiptpulse.dev"
}
```

## Dashboard Preview Assets

The original AWS validation screenshots are still included:

- [Architecture Diagram](./screenshots/architecture-diagram.png)
- [S3 Upload](./screenshots/s3-bucket-items.png)
- [CloudWatch Logs](./screenshots/cloudwatch-logs.png)
- [DynamoDB Records](./screenshots/dynamodb-items.png)
- [IAM Permissions](./screenshots/iam-role-permissions.png)
- [SES Notification](./screenshots/ses-email-received.png)

## Deployment

This repo now includes a **SAM template** in [template.yaml](./template.yaml).

It provisions:

- S3 bucket
- DynamoDB table
- dead-letter queue
- receipt processor Lambda
- dashboard API Lambda
- HTTP API routes

### Example Deploy Flow

```bash
sam build
sam deploy --guided
```

## Local Validation

You can do a lightweight syntax check with:

```bash
python -m py_compile lambda/*.py
```

The repo also includes sample event payloads in [events/](./events).

## Why It Works Well For Portfolio Use

This project now tells a stronger story than a standard OCR automation demo:

- it shows **event-driven AWS architecture**
- it demonstrates **AI-assisted document extraction**
- it includes **review logic and analytics**
- it has a **UI layer that communicates product value clearly**
- it feels closer to a real SaaS workflow than a one-function proof of concept

## Future Extensions

- approval workflow with Step Functions
- Cognito-based user authentication
- PDF report generation
- budget anomaly alerts
- vendor-level spend forecasting
- live dashboard deployment on S3 + CloudFront

## License

This project is licensed under the **MIT License**.
