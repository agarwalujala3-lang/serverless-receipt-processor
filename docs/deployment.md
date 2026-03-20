# Live Deployment Guide

This project is designed to go live in two parts:

1. **AWS SAM** for the serverless backend
2. **AWS Amplify Hosting** for the dashboard

## Prerequisites

- AWS account
- AWS CLI configured locally
- AWS SAM CLI installed
- A verified SES sender email in the same AWS Region where you deploy

Recommended Region for this project:

```text
ap-south-1
```

## Part 1: Deploy the Backend

### 1. Review deployment defaults

The repo includes [samconfig.toml](../samconfig.toml) with sensible defaults for a first production-style deploy.

Before deploying, update the email placeholders in that file:

```toml
SesSenderEmail=your-verified-sender@example.com
SesDefaultRecipientEmail=finance@example.com
```

### 2. Build the stack

```bash
sam build
```

### 3. Deploy the stack

```bash
sam deploy
```

If you want the guided prompt the first time:

```bash
sam deploy --guided
```

### 4. Save the API URL

After deployment, copy the `ReceiptApiUrl` output value.

You will use it in the dashboard deployment.

## Part 2: Make SES Actually Work

New SES accounts usually start in the sandbox. In sandbox mode, you can only send to verified addresses and sending volume is limited.

Before calling this live for public users:

1. Verify the sender identity in SES
2. If needed, verify the fallback recipient too
3. Request production access for SES in your deployed AWS Region

## Part 3: Deploy the Dashboard

### Option A: AWS Amplify Hosting

This repo already includes [amplify.yml](../amplify.yml).

In Amplify:

1. Create a new app from the GitHub repo
2. Keep the root of the repo as the app root
3. Add an environment variable:

```text
API_BASE_URL=https://your-api-id.execute-api.ap-south-1.amazonaws.com
```

4. Deploy

Amplify will copy the `dashboard/` folder into the published site and inject the live API base URL into `dashboard/config.js`.

### Option B: Manual Static Hosting

If you do not want Amplify, you can host `dashboard/` anywhere static hosting is supported.

In that case, edit [dashboard/config.js](../dashboard/config.js):

```js
window.RECEIPTPULSE_CONFIG = {
  apiBaseUrl: "https://your-api-id.execute-api.ap-south-1.amazonaws.com",
};
```

Then upload the `dashboard/` files to your static host.

## Quick Smoke Checks

After deployment, verify these:

### Backend

```text
GET /health
GET /analytics
GET /receipts
```

### Frontend

- dashboard loads without fallback errors
- mode badge changes from `Demo Dataset` to `Live API`
- analytics cards render from real data
- receipt table fills from the API

## Recommended Production Follow-ups

- add Cognito authentication before exposing review routes publicly
- restrict CORS to your Amplify domain instead of `*`
- add CloudWatch alarms for Lambda errors and DLQ activity
- add lifecycle policies to the S3 bucket
- add a custom domain for the dashboard
