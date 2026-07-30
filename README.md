# Flowmetric Analytics Workflow Automation

A browser-based analytics workflow that turns structured CSV data into cleaned records, calculated KPIs, quality checks, regional performance summaries, and stakeholder-ready exports.

## CSV format

Upload a comma-separated file with these headers:

```text
date,region,category,revenue,cost
```

The app validates required fields and numeric values, calculates profit and margin, flags records that need review, and lets users download the cleaned output.

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
