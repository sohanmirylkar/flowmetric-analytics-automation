"use client";

import { ChangeEvent, useMemo, useState } from "react";

type RecordRow = { date: string; region: string; category: string; revenue: number; cost: number; status: string };

const seed: RecordRow[] = [
  { date: "2026-07-01", region: "North", category: "Software", revenue: 18420, cost: 9200, status: "Valid" },
  { date: "2026-07-03", region: "West", category: "Services", revenue: 14880, cost: 8100, status: "Valid" },
  { date: "2026-07-06", region: "South", category: "Hardware", revenue: 11240, cost: 7350, status: "Valid" },
  { date: "2026-07-09", region: "East", category: "Software", revenue: 19650, cost: 10100, status: "Valid" },
  { date: "2026-07-12", region: "West", category: "Hardware", revenue: 9350, cost: 6420, status: "Review" },
  { date: "2026-07-15", region: "North", category: "Services", revenue: 16200, cost: 7900, status: "Valid" },
  { date: "2026-07-18", region: "South", category: "Software", revenue: 21100, cost: 10400, status: "Valid" },
  { date: "2026-07-21", region: "East", category: "Services", revenue: 13750, cost: 7100, status: "Valid" },
];

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function parseCsv(text: string): RecordRow[] {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  if (!headerLine) return [];
  const headers = headerLine.split(",").map((value) => value.trim().toLowerCase());
  const required = ["date", "region", "category", "revenue", "cost"];
  if (!required.every((column) => headers.includes(column))) throw new Error(`Missing columns. Required: ${required.join(", ")}`);
  return lines.filter(Boolean).map((line) => {
    const values = line.split(",").map((value) => value.trim());
    const get = (name: string) => values[headers.indexOf(name)] ?? "";
    const revenue = Number(get("revenue"));
    const cost = Number(get("cost"));
    const valid = get("date") && get("region") && get("category") && Number.isFinite(revenue) && Number.isFinite(cost);
    return { date: get("date"), region: get("region"), category: get("category"), revenue, cost, status: valid ? "Valid" : "Review" };
  });
}

export default function Home() {
  const [rows, setRows] = useState(seed);
  const [fileName, setFileName] = useState("sample_sales_data.csv");
  const [notice, setNotice] = useState("Demo data loaded — upload a CSV to run your own workflow.");
  const [region, setRegion] = useState("All regions");
  const filtered = region === "All regions" ? rows : rows.filter((row) => row.region === region);
  const totals = useMemo(() => {
    const revenue = filtered.reduce((sum, row) => sum + (Number.isFinite(row.revenue) ? row.revenue : 0), 0);
    const cost = filtered.reduce((sum, row) => sum + (Number.isFinite(row.cost) ? row.cost : 0), 0);
    return { revenue, profit: revenue - cost, margin: revenue ? ((revenue - cost) / revenue) * 100 : 0 };
  }, [filtered]);
  const byRegion = useMemo(() => {
    const result = new Map<string, number>();
    filtered.forEach((row) => result.set(row.region || "Unknown", (result.get(row.region || "Unknown") ?? 0) + row.revenue));
    return [...result.entries()].sort((a, b) => b[1] - a[1]);
  }, [filtered]);
  const maxRegion = Math.max(...byRegion.map(([, value]) => value), 1);
  const regions = [...new Set(rows.map((row) => row.region).filter(Boolean))];
  const issues = rows.filter((row) => row.status === "Review").length;

  async function onUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const parsed = parseCsv(await file.text());
      if (!parsed.length) throw new Error("The CSV contains no data rows.");
      setRows(parsed); setFileName(file.name); setRegion("All regions"); setNotice(`${parsed.length} records processed successfully.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to process this file.");
    }
  }

  function downloadCsv() {
    const header = "date,region,category,revenue,cost,profit,status";
    const data = rows.map((row) => [row.date, row.region, row.category, row.revenue, row.cost, row.revenue - row.cost, row.status].join(","));
    const url = URL.createObjectURL(new Blob([[header, ...data].join("\n")], { type: "text/csv" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "cleaned-business-output.csv"; anchor.click(); URL.revokeObjectURL(url);
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#overview" aria-label="Flowmetric home"><span className="brandMark">F</span><span>FLOWMETRIC</span></a>
        <nav aria-label="Primary navigation"><a className="active" href="#overview">Overview</a><a href="#workflow">Workflow</a><a href="#records">Data quality</a></nav>
        <button className="ghost" onClick={downloadCsv}>Export report</button>
      </header>
      <section className="hero" id="overview">
        <div><p className="eyebrow">AUTOMATED ANALYTICS WORKSPACE</p><h1>From raw records<br />to <em>clear decisions.</em></h1><p className="heroCopy">Ingest, validate, clean, and transform business data into stakeholder-ready metrics—without the repetitive spreadsheet work.</p></div>
        <div className="runCard" id="workflow">
          <div className="runTop"><span><i className="statusDot" /> WORKFLOW READY</span><span>CSV · EXCEL EXPORT</span></div>
          <div className="fileDrop"><span className="fileIcon">↗</span><div><strong>{fileName}</strong><small>{rows.length} records in current dataset</small></div><label className="uploadButton">Choose CSV<input type="file" accept=".csv,text/csv" onChange={onUpload} /></label></div>
          <p className="notice">{notice}</p>
          <div className="pipeline" aria-label="Workflow progress"><span>01 INGEST</span><i /><span>02 VALIDATE</span><i /><span>03 TRANSFORM</span><i /><span>04 REPORT</span></div>
        </div>
      </section>
      <section className="dashboard">
        <div className="sectionHead"><div><p className="eyebrow">PERFORMANCE SNAPSHOT</p><h2>Executive overview</h2></div><select value={region} onChange={(event) => setRegion(event.target.value)} aria-label="Filter by region"><option>All regions</option>{regions.map((name) => <option key={name}>{name}</option>)}</select></div>
        <div className="kpis">
          <article><span>REVENUE</span><strong>{money.format(totals.revenue)}</strong><small>Processed dataset</small></article>
          <article><span>GROSS PROFIT</span><strong>{money.format(totals.profit)}</strong><small>Revenue less cost</small></article>
          <article><span>PROFIT MARGIN</span><strong>{totals.margin.toFixed(1)}%</strong><small>Calculated automatically</small></article>
          <article className={issues ? "warn" : ""}><span>QUALITY FLAGS</span><strong>{issues}</strong><small>{issues ? "Records need review" : "All checks passed"}</small></article>
        </div>
        <div className="analyticsGrid">
          <article className="chartCard"><div className="cardTitle"><div><span>REVENUE DISTRIBUTION</span><h3>Performance by region</h3></div><span className="live">● LIVE</span></div><div className="bars">{byRegion.map(([name, value]) => <div className="barRow" key={name}><span>{name}</span><div><i style={{ width: `${(value / maxRegion) * 100}%` }} /></div><strong>{money.format(value)}</strong></div>)}</div></article>
          <article className="qualityCard"><span>DATA HEALTH</span><div className="score">{Math.round(((rows.length - issues) / Math.max(rows.length, 1)) * 100)}<sup>%</sup></div><p>Records passing validation</p><ul><li><span>Required fields</span><b>Checked</b></li><li><span>Numeric formats</span><b>Checked</b></li><li><span>Business metrics</span><b>Calculated</b></li></ul></article>
        </div>
        <article className="tableCard" id="records"><div className="cardTitle"><div><span>CLEANED OUTPUT</span><h3>Validated business records</h3></div><button className="textButton" onClick={downloadCsv}>Download CSV ↓</button></div><div className="tableWrap"><table><thead><tr><th>Date</th><th>Region</th><th>Category</th><th>Revenue</th><th>Cost</th><th>Profit</th><th>Status</th></tr></thead><tbody>{filtered.slice(0, 8).map((row, index) => <tr key={`${row.date}-${index}`}><td>{row.date}</td><td>{row.region}</td><td>{row.category}</td><td>{money.format(row.revenue)}</td><td>{money.format(row.cost)}</td><td>{money.format(row.revenue - row.cost)}</td><td><span className={`tag ${row.status === "Review" ? "review" : ""}`}>{row.status}</span></td></tr>)}</tbody></table></div></article>
      </section>
      <footer><span>FLOWMETRIC / ANALYTICS AUTOMATION</span><span>Structured data → validated insight → better decisions</span></footer>
    </main>
  );
}
