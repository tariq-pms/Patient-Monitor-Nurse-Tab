import axios from 'axios';
import https from 'https';
import ExcelJS from 'exceljs';
/**
 * fetchObservationHistory.js
 *
 * Fetches version history of a FHIR Observation resource and exports to Excel.
 *
 * Install deps:
 *   npm install axios exceljs
 *
 * Usage:
 *   node fetchObservationHistory.js
 */

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const AUTH_USERNAME = "fhiruser";
const AUTH_PASSWORD = "change-password";
const FHIR_BASE_URL = "https://pmsind.co.in/fhir";
const FHIR_INTERNAL_BASE = "http://fhir-server:9080/fhir-server/api/v4";

const OBSERVATION_ID = "19ca591a1b0-48cd1727-6000-4993-8500-8614dc4ec9f5";
const OUTPUT_FILE = "observation_history.xlsx";

const MAX_PAGES = 500;       // Set to Infinity to fetch all 15,797 versions
const DELAY_MS = 300;        // Wait between requests (ms) — reduces server pressure
const MAX_RETRIES = 5;       // Retry attempts per page on failure
const RETRY_DELAY_MS = 2000; // Wait before retrying after a failure (ms)
// ─────────────────────────────────────────────────────────────────────────────

const axiosInstance = axios.create({
  baseURL: FHIR_BASE_URL,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
    keepAlive: true,          // Reuse TCP connections
    maxSockets: 1,            // One socket at a time — avoids overwhelming server
    timeout: 30000,           // Socket timeout 30s
  }),
  auth: {
    username: AUTH_USERNAME,
    password: AUTH_PASSWORD,
  },
  headers: {
    "Content-Type": "application/json",
    "Connection": "keep-alive",
  },
  timeout: 30000, // Request timeout 30s
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function rewriteUrl(url) {
  if (!url) return null;
  return url.replace(FHIR_INTERNAL_BASE, FHIR_BASE_URL);
}

/**
 * Fetch a single page with retry logic.
 */
async function fetchPageWithRetry(url, attempt = 1) {
  try {
    const { data } = await axiosInstance.get(url);
    return data;
  } catch (err) {
    const reason = err.response?.data ?? err.message;
    if (attempt <= MAX_RETRIES) {
      const waitMs = RETRY_DELAY_MS * attempt; // Exponential back-off
      process.stdout.write(`\n  ⚠️  Error on attempt ${attempt}/${MAX_RETRIES}: ${typeof reason === "string" ? reason : JSON.stringify(reason)}`);
      process.stdout.write(`\n  ↻  Retrying in ${waitMs / 1000}s...\n`);
      await sleep(waitMs);
      return fetchPageWithRetry(url, attempt + 1);
    }
    throw new Error(`Failed after ${MAX_RETRIES} retries: ${typeof reason === "string" ? reason : JSON.stringify(reason)}`);
  }
}

/**
 * Fetch all pages of the version history bundle up to MAX_PAGES.
 */
async function fetchAllVersions() {
  let url = `/Observation/${OBSERVATION_ID}/_history`;
  const allEntries = [];
  let page = 1;

  while (url) {
    process.stdout.write(`\r  Fetching page ${page}... (${allEntries.length} entries so far)   `);

    const bundle = await fetchPageWithRetry(url);
    if (bundle.entry) allEntries.push(...bundle.entry);

    if (page >= MAX_PAGES) {
      console.log(`\n  ⚠️  Stopped at MAX_PAGES=${MAX_PAGES}. Total available on server: ${bundle.total}`);
      break;
    }

    const nextLink = bundle.link?.find((l) => l.relation === "next");
    if (nextLink) {
      const rewritten = rewriteUrl(nextLink.url);
      url = rewritten.replace(FHIR_BASE_URL, "");
      page++;
      await sleep(DELAY_MS); // Pause between pages
    } else {
      url = null;
    }
  }

  console.log(`\n  ✅ Fetched ${allEntries.length} entries across ${page} page(s).`);
  return allEntries;
}

function flattenComponents(resource) {
  const map = {};
  for (const comp of resource.component || []) {
    const key = comp.code?.text?.trim() || comp.code?.coding?.[0]?.display || "UNKNOWN";
    const vq = comp.valueQuantity;
    map[key] = vq !== undefined ? `${vq.value} ${vq.unit || ""}`.trim() : "";
  }
  return map;
}

function collectAllComponentKeys(entries) {
  const keys = new Set();
  for (const entry of entries) {
    Object.keys(flattenComponents(entry.resource || {})).forEach((k) => keys.add(k));
  }
  return [...keys];
}

function styleHeaderRow(row, bgColor = "FF2E75B6") {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, name: "Arial", size: 10 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = {
      top: { style: "thin" }, bottom: { style: "thin" },
      left: { style: "thin" }, right: { style: "thin" },
    };
  });
  row.height = 30;
}

function styleDataRow(row, shade = false) {
  row.eachCell((cell) => {
    cell.font = { name: "Arial", size: 10 };
    cell.border = {
      top: { style: "thin" }, bottom: { style: "thin" },
      left: { style: "thin" }, right: { style: "thin" },
    };
    cell.alignment = { vertical: "middle" };
    if (shade) {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2F2F2" } };
    }
  });
}

function autoSizeColumns(sheet, headers) {
  sheet.columns.forEach((col, i) => {
    let maxLen = (headers[i] || "").length;
    col.eachCell({ includeEmpty: false }, (cell) => {
      const len = String(cell.value || "").length;
      if (len > maxLen) maxLen = len;
    });
    col.width = Math.min(Math.max(maxLen + 2, 14), 45);
  });
}

async function main() {
  console.log(`\nFetching version history for Observation/${OBSERVATION_ID}`);
  console.log(`Server     : ${FHIR_BASE_URL}`);
  console.log(`Limit      : ${MAX_PAGES === Infinity ? "ALL pages" : `${MAX_PAGES} pages`}`);
  console.log(`Delay      : ${DELAY_MS}ms between pages`);
  console.log(`Max Retries: ${MAX_RETRIES} per page\n`);

  const entries = await fetchAllVersions();

  // Sort newest first
  const sorted = [...entries].sort((a, b) => {
    const va = parseInt(a.resource?.meta?.versionId || "0");
    const vb = parseInt(b.resource?.meta?.versionId || "0");
    return vb - va;
  });

  const allComponentKeys = collectAllComponentKeys(sorted);

  console.log("\nBuilding Excel workbook...");

  const wb = new ExcelJS.Workbook();
  wb.creator = "FHIR Observation Exporter";
  wb.created = new Date();

  // ── Sheet 1: Version Summary ───────────────────────────────────────────────
  const summarySheet = wb.addWorksheet("Version Summary");

  const summaryHeaders = [
    "Version ID", "Last Updated (UTC)", "Status", "Effective Date/Time",
    "Subject Reference", "Device Reference", "Identifier",
    ...allComponentKeys,
  ];

  summarySheet.addRow(summaryHeaders);
  styleHeaderRow(summarySheet.getRow(1));

  sorted.forEach((entry, idx) => {
    const r = entry.resource;
    if (!r) return;
    const components = flattenComponents(r);
    const row = summarySheet.addRow([
      r.meta?.versionId ?? "",
      r.meta?.lastUpdated ?? "",
      r.status ?? "",
      r.effectiveDateTime ?? "",
      r.subject?.reference ?? "",
      r.device?.reference ?? "",
      r.identifier?.map((i) => i.value).join(", ") ?? "",
      ...allComponentKeys.map((k) => components[k] ?? ""),
    ]);
    styleDataRow(row, idx % 2 === 1);
  });

  autoSizeColumns(summarySheet, summaryHeaders);
  summarySheet.views = [{ state: "frozen", ySplit: 1 }];

  // ── Sheet 2: Component Detail ──────────────────────────────────────────────
  const detailSheet = wb.addWorksheet("Component Detail");

  const detailHeaders = [
    "Version ID", "Last Updated (UTC)", "Effective Date/Time",
    "Component Name", "Value", "Unit",
  ];
  detailSheet.addRow(detailHeaders);
  styleHeaderRow(detailSheet.getRow(1), "FF404040");

  let detailIdx = 0;
  for (const entry of sorted) {
    const r = entry.resource;
    if (!r) continue;
    for (const comp of r.component || []) {
      const name = comp.code?.text?.trim() || comp.code?.coding?.[0]?.display || "UNKNOWN";
      const vq = comp.valueQuantity;
      const row = detailSheet.addRow([
        r.meta?.versionId ?? "",
        r.meta?.lastUpdated ?? "",
        r.effectiveDateTime ?? "",
        name,
        vq?.value ?? "",
        vq?.unit ?? "",
      ]);
      styleDataRow(row, detailIdx % 2 === 1);
      detailIdx++;
    }
  }

  autoSizeColumns(detailSheet, detailHeaders);
  detailSheet.views = [{ state: "frozen", ySplit: 1 }];

  // ── Sheet 3: Raw JSON ──────────────────────────────────────────────────────
  const rawSheet = wb.addWorksheet("Raw JSON");
  rawSheet.addRow(["Version ID", "Last Updated", "Raw JSON"]);
  styleHeaderRow(rawSheet.getRow(1), "FF7030A0");

  for (const entry of sorted) {
    const r = entry.resource;
    if (!r) continue;
    const row = rawSheet.addRow([
      r.meta?.versionId ?? "",
      r.meta?.lastUpdated ?? "",
      JSON.stringify(r, null, 2),
    ]);
    row.getCell(3).alignment = { wrapText: true, vertical: "top" };
    row.height = 80;
  }

  rawSheet.getColumn(1).width = 15;
  rawSheet.getColumn(2).width = 28;
  rawSheet.getColumn(3).width = 100;
  rawSheet.views = [{ state: "frozen", ySplit: 1 }];

  // ── Save ───────────────────────────────────────────────────────────────────
  await wb.xlsx.writeFile(OUTPUT_FILE);
  console.log(`\n✅ Saved: ${OUTPUT_FILE}`);
  console.log(`   Versions exported : ${sorted.length}`);
  console.log(`   Sheets            : Version Summary, Component Detail, Raw JSON`);
}

main().catch((err) => {
  console.error("\n❌ Error:", err.message);
  process.exit(1);
});
