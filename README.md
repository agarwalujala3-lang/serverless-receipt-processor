# ReceiptPulse

ReceiptPulse is a serverless receipt intelligence platform built on AWS. It turns uploaded receipts into structured expense records, flags risky submissions for review, detects duplicates, stores analytics-ready data in DynamoDB, exposes review and export APIs, and includes a polished dashboard for both portfolio demos and real operations.

## What Makes This Stronger

The project now reads like a product instead of a single Lambda demo:

- smart receipt enrichment with category, confidence, review status, and duplicate keys
- review and analytics API for operations workflows
- premium dashboard UI for technical and non-technical viewers
- live browser upload console with preview, history drawer, and processing timeline
- SAM template for backend deployment
- Amplify build configuration for static frontend hosting
- deployment docs for AWS launch and custom-domain finish

## Architecture

1. A receipt is uploaded to Amazon S3
2. S3 triggers a Lambda function
3. Lambda calls Amazon Textract AnalyzeExpense
4. The processor enriches the result with:
   - vendor
   - date
   - total amount
   - line items
   - category
   - confidence score
   - duplicate key
   - review status
5. The enriched record is stored in DynamoDB
6. SES sends a receipt processing notification
7. A second Lambda exposes analytics, review, and export endpoints through HTTP API
8. The static dashboard reads from the live API and renders a review console

## AWS Services Used

- Amazon S3
- AWS Lambda
- Amazon Textract
- Amazon DynamoDB
- Amazon SES
- Amazon API Gateway HTTP API
- Amazon SQS
- IAM
- AWS Amplify Hosting

## Features

### Receipt Intelligence

- multi-record S3 event handling
- vendor, date, amount, and line-item extraction
- category inference from vendors and items
- confidence-based review routing
- duplicate detection using hashed receipt signatures
- uploader-aware notifications

### API Layer

- `GET /health`
- `GET /receipts`
- `GET /analytics`
- `GET /exports/csv`
- `PATCH /receipts/{receiptId}/review`

### Dashboard

The dashboard in [dashboard](./dashboard) is designed to look strong for both recruiters and engineers.

It includes:

- premium hero section
- receipt upload with live preview
- saved browser-side upload history drawer
- success burst animation when a receipt clears the pipeline
- animated metric counters
- category spend bars
- vendor spend heatmap
- review queue
- monthly trend visualization
- architecture storytelling panel
- filterable receipt table

By default it loads demo data. In live mode it reads the backend API from:

- the `?api=` query parameter, or
- [dashboard/config.js](./dashboard/config.js), which can be generated automatically during Amplify deploys

## Repository Structure

```text
.
|-- .github/workflows/validate.yml
|-- amplify.yml
|-- dashboard/
|   |-- app.js
|   |-- config.js
|   |-- data/demo-dashboard.json
|   |-- index.html
|   `-- styles.css
|-- docs/deployment.md
|-- events/
|   |-- sample_review_event.json
|   `-- sample_s3_event.json
|-- lambda/
|   |-- dashboard_api.py
|   `-- lambda_function.py
|-- sample-receipts/
|-- screenshots/
|-- samconfig.toml
`-- template.yaml
```

## Important Files

### [lambda/lambda_function.py](./lambda/lambda_function.py)

- processes S3 upload events
- calls Textract AnalyzeExpense
- normalizes dates and amounts
- calculates confidence
- infers categories
- checks for duplicates
- stores enriched records
- sends SES notifications

### [lambda/dashboard_api.py](./lambda/dashboard_api.py)

- returns receipt lists
- builds analytics summaries
- exports CSV
- updates review state

### [template.yaml](./template.yaml)

- provisions the backend with SAM
- creates the bucket, DynamoDB table, DLQ, API, and Lambdas
- accepts deploy-time parameters for SES sender, fallback recipient, and confidence threshold

### [amplify.yml](./amplify.yml)

- publishes the dashboard as a static site
- injects the live backend API URL through the `API_BASE_URL` environment variable

### [samconfig.toml](./samconfig.toml)

- provides a practical default deployment profile for `ap-south-1`

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

## Deploying It Live

This repo is ready for a two-part deployment:

1. backend on AWS using SAM
2. frontend on AWS Amplify Hosting

### Backend

Update the email placeholders in [samconfig.toml](./samconfig.toml), then run:

```bash
sam build
sam deploy
```

If this is your first deploy and you want guided prompts:

```bash
sam deploy --guided
```

### Frontend

Connect the repo in Amplify and add this environment variable:

```text
API_BASE_URL=https://your-api-id.execute-api.ap-south-1.amazonaws.com
```

Amplify will publish the dashboard and inject the API URL into [dashboard/config.js](./dashboard/config.js) during the build.

Detailed steps are in [docs/deployment.md](./docs/deployment.md).

### Custom Domain

The live frontend can be finished under a branded domain by attaching an ACM certificate and alias
to the CloudFront distribution. The exact Route 53 / DNS steps are documented in
[docs/deployment.md](./docs/deployment.md#custom-domain-on-cloudfront).

## SES Note

For public live email delivery, your SES account must be out of sandbox mode in the same AWS Region where you deploy. Otherwise email sending will be limited to verified addresses.

## Validation

The repo includes:

- sample events in [events](./events)
- a GitHub Actions validation workflow in [.github/workflows/validate.yml](./.github/workflows/validate.yml)

Lightweight local check:

```bash
python -m py_compile lambda/*.py
node --check dashboard/app.js
```

## Why It Works Well For Portfolio Use

- shows event-driven cloud design
- demonstrates AI-assisted document extraction
- includes review logic and analytics, not just OCR
- has a strong visual layer for demos
- is deployable as a real cloud project

## Future Extensions

- Cognito authentication
- Step Functions approval workflow
- budget anomaly alerts
- vendor forecasting
- PDF report generation
- domain-based multi-tenant expense routing

## License

This project is licensed under the MIT License.
