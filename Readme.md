# SaaS Billing App Using Cloudflare Workers

This project implements a **SaaS Billing System** using **Cloudflare Workers**. The app manages subscription plans, automatically generates invoices, processes payments, retries failed payments, and sends email notifications via SendGrid. It utilizes Cloudflare's serverless environment for high scalability and performance.

## Features

- **Subscription Management**: Create and manage subscription plans with different pricing and billing cycles.
- **Billing Engine**: Automatically generate invoices at the end of each billing cycle, handle prorated billing, and update customer invoices.
- **Payment Processing**: Record payments, update invoice status, handle failed payments, and retry failed payments via scheduled cron jobs.
- **Notifications**: Send email notifications to customers when invoices are generated, payments are successful, or payments fail using SendGrid.
- **Storage**: Uses Cloudflare Workers KV to store customer, subscription, invoice, and payment data.
  
## Project Structure

```bash
app/
│
├── src/
│   ├── handlers/
│   │   ├── billingHandler.ts           # Handles invoice generation
│   │   ├── paymentHandler.ts           # Handles payment processing
│   │   └── retryPayments.ts            # Handles retrying failed payments
│   ├── models/
│   │   ├── customer.ts                 # Customer entity model
│   │   ├── invoice.ts                  # Invoice and Payment models
│   │   ├── payment.ts                  # Payment entity model
│   │   └── subscriptionPlan.ts         # Subscription plan entity model
│   ├── scheduled/
│   │   └── retryPayments.ts            # Scheduled task for retrying failed payments
│   └── utils/
│       └── sendGrid.ts                 # SendGrid email utility
│
├── wrangler.toml                        # Cloudflare Workers config with cron jobs
├── tsconfig.json                        # TypeScript config
├── package.json                         # Project dependencies and scripts
└── README.md                            # Project readme
```

## Setup Instructions

### Prerequisites
- **Cloudflare account**: You will need a Cloudflare account to deploy Workers.
- **SendGrid account**: SendGrid is used for email notifications. Create an account and generate an API key.
- **Wrangler**: Install Wrangler CLI, Cloudflare’s CLI for managing Workers.

```bash
npm install -g wrangler
```

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/dany611/BillingApp
   cd app
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure environment variables**:
   - Add your **SendGrid API key** to the `SENDGRID_API_KEY` environment variable inside the `wrangler.toml` file:
   ```toml
   [env.production]
   SENDGRID_API_KEY = "your-sendgrid-api-key"
   ```

4. **Set up Cloudflare KV Namespace**:
   - Create a KV namespace in your Cloudflare dashboard.
   - Add the namespace to your `wrangler.toml` file:
   ```toml
   kv_namespaces = [
     { binding = "KV_SUBSCRIPTION_DATA", id = "your-kv-namespace-id" }
   ]
   ```

### Running in Development

To run the project in development mode:

```bash
wrangler dev
```

### Building the Project

To compile TypeScript and build the project:

```bash
npm run build
```

### Deploying to Cloudflare Workers

To deploy the project to Cloudflare Workers:

```bash
wrangler publish
```

## Usage

### Cron Jobs
The app uses Cloudflare Workers’ cron jobs to handle automatic invoicing and retrying failed payments.

- **Generate Invoices**: Runs at midnight daily (`0 0 * * *`). Generates invoices for customers at the end of their billing cycles.
- **Retry Failed Payments**: Runs at 2 AM daily (`0 2 * * *`). Retries payments that failed the previous day.

You can configure these schedules in the `wrangler.toml` file under the `triggers.crons` section.

```toml
[[triggers.crons]]
schedule = "0 0 * * *" # Generate invoices daily at midnight
path = "/generate-invoice"

[[triggers.crons]]
schedule = "0 2 * * *" # Retry failed payments at 2 AM daily
path = "/retry-failed-payments"
```

### API Endpoints

#### 1. Generate Invoices (`/generate-invoice`)
This endpoint is triggered by the cron job to automatically generate invoices for all customers. It calculates the invoice amount based on the customer’s current subscription plan.

#### 2. Retry Failed Payments (`/retry-failed-payments`)
This endpoint is triggered by the cron job to retry failed payments from the previous day.

#### 3. Handle Payment (`/payment`)
You can make a POST request to this endpoint with payment details to process a payment. The payment status is updated, and customers are notified via email.

Example request:

```bash
POST /payment
{
  "invoiceId": "invoice-123",
  "amount": 50.00,
  "paymentMethod": "credit_card"
}
```

### Storage

- **Customer, Invoice, and Payment data** are stored in Cloudflare Workers KV.
- **Subscription data** is managed using the `KV_SUBSCRIPTION_DATA` namespace.

## Extending the App

- **Subscription Plans**: You can add more subscription plans or extend the functionality to support free trials, discounts, etc.
- **Prorated Billing**: The app handles prorated billing for mid-cycle upgrades and downgrades. You can adjust this behavior based on your business logic.
- **Payment Processors**: Integrate with real payment processors like Stripe or PayPal for actual payment handling.

## License

This project is licensed under the MIT License.