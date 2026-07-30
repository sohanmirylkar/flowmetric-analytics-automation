"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";

type RetailRow = {
  transactionId: string; date: string; customerId: string; gender: string; age: number;
  category: string; quantity: number; price: number; revenue: number; status: "Valid" | "Review";
};

const preview: RetailRow[] = [
  { transactionId: "1", date: "2023-11-24", customerId: "CUST001", gender: "Male", age: 34, category: "Beauty", quantity: 3, price: 50, revenue: 150, status: "Valid" },
  { transactionId: "2", date: "2023-02-27", customerId: "CUST002", gender: "Female", age: 26, category: "Clothing", quantity: 2, price: 500, revenue: 1000, status: "Valid" },
  { transactionId: "3", date: "2023-01-13", customerId: "CUST003", gender: "Male", age: 50, category: "Electronics", quantity: 1, price: 30, revenue: 30, status: "Valid" },
];

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function parseCsv(text: string): RetailRow[] {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  if (!headerLine) return [];
  const headers = headerLine.split(",").map((value) => value.trim().toLowerCase());
  const required = ["transaction id", "date", "customer id", "gender", "age", "product category", "quantity", "price per unit", "total amount"];
  if (!required.every((column) => headers.includes(column))) throw new Error(`Missing Kaggle retail columns. Required: ${required.join(", ")}`);
  return lines.filter(Boolean).map((line) => {
    const values = line.split(",").map((value) => value.trim());
    const get = (name: string) => values[headers.indexOf(name)] ?? "";
    const age = Number(get("age")), quantity = Number(get("quantity")), price = Number(get("price per unit")), revenue = Number(get("total amount"));
    const valid = Boolean(get("transaction id") && get("date") && get("customer id") && get("product category")
      && Number.isFinite(age) && Number.isFinite(quantity) && Number.isFinite(price) && Number.isFinite(revenue)
      && Math.abs(quantity * price - revenue) < 0.01);
    return {
      transactionId: get("transaction id"), date: get("date"), customerId: get("customer id"), gender: get("gender"),
      age, category: get("product category"), quantity, price, revenue, status: valid ? "Valid" : "Review",
    };
  });
}

export default function Home() {
  const [rows, setRows] = useState(preview);
  const [fileName, setFileName] = useState("retail_sales_dataset.csv");
  const [notice, setNotice] = useState("Loading 1,000 Kaggle retail transactions…");
  const [category, setCategory] = useState("All categories");

  useEffect(() => {
    fetch("./data/retail_sales_dataset.csv")
      .then((response) => {
        if (!response.ok) throw new Error("Dataset could not be loaded.");
        return response.text();
      })
      .then((text) => {
        const parsed = parseCsv(text);
        setRows(parsed);
        setNotice(`${parsed.length.toLocaleString()} Kaggle records loaded and validated.`);
      })
      .catch(() => setNotice("Preview data loaded. You can still upload the Kaggle CSV."));
  }, []);

  const filtered = category === "All categories" ? rows : rows.filter((row) => row.category === category);
  const metrics = useMemo(() => {
    const revenue = filtered.reduce((sum, row) => sum + (Number.isFinite(row.revenue) ? row.revenue : 0), 0);
    const units = filtered.reduce((sum, row) => sum + (Number.isFinite(row.quantity) ? row.quantity : 0), 0);
    return { revenue, units, averageOrder: filtered.length ? revenue / filtered.length : 0 };
  }, [filtered]);
  const byCategory = useMemo(() => {
    const result = new Map<string, number>();
    filtered.forEach((row) => result.set(row.category || "Unknown", (result.get(row.category || "Unknown") ?? 0) + row.revenue));
    return [...result.entries()].sort((a, b) => b[1] - a[1]);
  }, [filtered]);
  const maxCategory = Math.max(...byCategory.map(([, value]) => value), 1);
  const categories = [...new Set(rows.map((row) => row.category).filter(Boolean))];
  const issues = rows.filter((row) => row.status === "Review").length;

  async function onUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const parsed = parseCsv(await file.text());
      if (!parsed.length) throw new Error("The CSV contains no data rows.");
      setRows(parsed); setFileName(file.name); setCategory("All categories"); setNotice(`${parsed.length.toLocaleString()} records processed successfully.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to process this file.");
    }
  }

  function downloadCsv() {
    const header = "transaction_id,date,customer_id,gender,age,product_category,quantity,price_per_unit,total_amount,status";
    const data = rows.map((row) => [row.transactionId, row.date, row.customerId, row.gender, row.age, row.category, row.quantity, row.price, row.revenue, row.status].join(","));
    const url = URL.createObjectURL(new Blob([[header, ...data].join("\n")], { type: "text/csv" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "validated-kaggle-retail-output.csv"; anchor.click(); URL.revokeObjectURL(url);
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#overview" aria-label="Flowmetric home"><span className="brandMark">F</span><span>FLOWMETRIC</span></a>
        <nav aria-label="Primary navigation"><a className="active" href="#overview">Overview</a><a href="#workflow">Workflow</a><a href="#records">Data quality</a></nav>
        <button className="ghost" onClick={downloadCsv}>Export report</button>
      </header>
      <section className="hero" id="overview">
        <div>
          <p className="eyebrow">KAGGLE RETAIL ANALYTICS WORKSPACE</p>
          <h1>From raw records<br />to <em>clear decisions.</em></h1>
          <p className="heroCopy">Explore 1,000 retail transactions through an automated workflow for validation, cleaning, KPI calculation, and stakeholder-ready reporting.</p>
          <a className="sourceLink" href="https://www.kaggle.com/datasets/mohammadtalib786/retail-sales-dataset" target="_blank" rel="noreferrer">Source: Kaggle Retail Sales Dataset · CC0 Public Domain ↗</a>
        </div>
        <div className="runCard" id="workflow">
          <div className="runTop"><span><i className="statusDot" /> WORKFLOW READY</span><span>KAGGLE CSV · EXPORT</span></div>
          <div className="fileDrop"><span className="fileIcon">↗</span><div><strong>{fileName}</strong><small>{rows.length.toLocaleString()} transactions in current dataset</small></div><label className="uploadButton">Choose CSV<input type="file" accept=".csv,text/csv" onChange={onUpload} /></label></div>
          <p className="notice">{notice}</p>
          <div className="pipeline" aria-label="Workflow progress"><span>01 INGEST</span><i /><span>02 VALIDATE</span><i /><span>03 TRANSFORM</span><i /><span>04 REPORT</span></div>
        </div>
      </section>
      <section className="dashboard">
        <div className="sectionHead"><div><p className="eyebrow">2023 RETAIL PERFORMANCE</p><h2>Executive overview</h2></div><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by product category"><option>All categories</option>{categories.map((name) => <option key={name}>{name}</option>)}</select></div>
        <div className="kpis">
          <article><span>SALES REVENUE</span><strong>{money.format(metrics.revenue)}</strong><small>Across filtered transactions</small></article>
          <article><span>UNITS SOLD</span><strong>{metrics.units.toLocaleString()}</strong><small>Quantity purchased</small></article>
          <article><span>AVERAGE ORDER</span><strong>{money.format(metrics.averageOrder)}</strong><small>Revenue per transaction</small></article>
          <article className={issues ? "warn" : ""}><span>QUALITY FLAGS</span><strong>{issues}</strong><small>{issues ? "Records need review" : "All checks passed"}</small></article>
        </div>
        <div className="analyticsGrid">
          <article className="chartCard"><div className="cardTitle"><div><span>SALES DISTRIBUTION</span><h3>Revenue by product category</h3></div><span className="live">● KAGGLE</span></div><div className="bars">{byCategory.map(([name, value]) => <div className="barRow" key={name}><span>{name}</span><div><i style={{ width: `${(value / maxCategory) * 100}%` }} /></div><strong>{money.format(value)}</strong></div>)}</div></article>
          <article className="qualityCard"><span>DATA HEALTH</span><div className="score">{Math.round(((rows.length - issues) / Math.max(rows.length, 1)) * 100)}<sup>%</sup></div><p>Records passing validation</p><ul><li><span>Required fields</span><b>Checked</b></li><li><span>Numeric formats</span><b>Checked</b></li><li><span>Quantity × price</span><b>Reconciled</b></li></ul></article>
        </div>
        <article className="tableCard" id="records"><div className="cardTitle"><div><span>VALIDATED OUTPUT</span><h3>Kaggle retail transactions</h3></div><button className="textButton" onClick={downloadCsv}>Download CSV ↓</button></div><div className="tableWrap"><table><thead><tr><th>Transaction</th><th>Date</th><th>Customer</th><th>Category</th><th>Units</th><th>Unit price</th><th>Total</th><th>Status</th></tr></thead><tbody>{filtered.slice(0, 8).map((row) => <tr key={row.transactionId}><td>#{row.transactionId}</td><td>{row.date}</td><td>{row.customerId}</td><td>{row.category}</td><td>{row.quantity}</td><td>{money.format(row.price)}</td><td>{money.format(row.revenue)}</td><td><span className={`tag ${row.status === "Review" ? "review" : ""}`}>{row.status}</span></td></tr>)}</tbody></table></div></article>
      </section>
      <footer><span>FLOWMETRIC / KAGGLE RETAIL ANALYTICS</span><span>Dataset by Mohammad Talib · CC0 Public Domain</span></footer>
    </main>
  );
}
