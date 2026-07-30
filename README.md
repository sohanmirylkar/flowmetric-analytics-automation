# Flowmetric Analytics Workflow Automation

A browser-based analytics workflow that turns Kaggle retail transactions into validated records, calculated KPIs, quality checks, category performance summaries, and stakeholder-ready exports.

## Dataset

The bundled default data is [Retail Sales Dataset by Mohammad Talib](https://www.kaggle.com/datasets/mohammadtalib786/retail-sales-dataset) from Kaggle. It contains 1,000 fictional retail transactions from 2023 and is published under the CC0 Public Domain license.

## CSV format

Upload a comma-separated file with these headers:

```text
Transaction ID,Date,Customer ID,Gender,Age,Product Category,Quantity,Price per Unit,Total Amount
```

The app validates required fields and numeric values, reconciles `Quantity × Price per Unit` against `Total Amount`, flags records that need review, and lets users download the validated output.

## Local development

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality checks

```bash
npm run lint
npm run build
```

Uploaded data stays in the user's browser and is never sent to a server.
