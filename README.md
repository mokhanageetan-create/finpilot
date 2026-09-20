# FinPilot

FinPilot is a personal finance decision-support workspace for understanding spending, recurring payments, budgets, goals, and transaction history.

## Live website

[Open FinPilot](https://finpilot-fk3uhkpu.manus.space)

## Highlights

- Manus OAuth authentication for private workspaces
- PDF bank-statement upload with browser-based text extraction
- Transaction categorization and searchable ledger
- Recurring-payment, budget, goal, and financial insight views
- Personalized AI Assistant responses grounded in the connected workspace data
- Empty states that avoid inventing financial records when no data is connected

## Development

The project uses React, Vite, TypeScript, Express, tRPC, Drizzle, and MySQL/TiDB.

```bash
pnpm install
pnpm dev
```

Run validation and create a production build:

```bash
pnpm check
pnpm test
pnpm build
```

## PDF imports

Use the **Transactions** page to upload a text-based bank-statement PDF. FinPilot extracts transaction dates, descriptions, amounts, and credit/debit signals in the browser. Scanned image-only PDFs require OCR support and may not produce extractable transactions.

## Authentication

Sign in through Manus OAuth to access the private workspace. Financial data is not seeded into new workspaces; import a statement or connect a supported provider before using data-grounded insights.

## Safety note

FinPilot is a decision-support tool for organizing and understanding user-provided financial data. It does not provide investment, tax, lending, or financial-product advice.
