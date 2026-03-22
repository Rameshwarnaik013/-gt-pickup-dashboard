// ============================================================
// GT PICKUP DASHBOARD — Google Apps Script (Code.gs)
// ============================================================
// HOW TO USE:
// 1. Open your Google Sheet (the one with "GT Pikcup" tab)
// 2. Go to Extensions > Apps Script
// 3. Delete existing code, paste this entire file
// 4. Click "Deploy" > "Manage deployments" > Edit > New version > Deploy
// ============================================================

const SHEET_NAME = "GT Pikcup";

function doGet(e) {
  return buildResponse();
}

function buildResponse() {
  try {
    const ss     = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = ss.getSheets();

    // Find sheet by trimmed name (handles accidental leading/trailing spaces)
    const sheet  = sheets.find(s => s.getName().trim() === SHEET_NAME.trim());

    if (!sheet) {
      return jsonResponse({
        error: "Sheet not found: '" + SHEET_NAME + "'. Available sheets: " +
               sheets.map(s => "'" + s.getName() + "'").join(", ")
      });
    }

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      return jsonResponse({ rows: [], summary: buildSummary([]) });
    }

    const headers = data[0].map(h => h.toString().trim());
    const rows    = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row.every(cell => cell === "" || cell === null || cell === undefined)) continue;

      const obj = {};
      headers.forEach((h, idx) => {
        const val = row[idx];
        if (val instanceof Date) {
          obj[h] = Utilities.formatDate(val, Session.getScriptTimeZone(), "dd-MMM-yyyy");
        } else {
          obj[h] = val !== undefined && val !== null ? val.toString().trim() : "";
        }
      });
      rows.push(obj);
    }

    // Sort rows by Mail Received Date descending (latest first)
    rows.sort((a, b) => {
      const da = parseDate(a["Mail Receievd  Date"] || "");
      const db = parseDate(b["Mail Receievd  Date"] || "");
      if (da && db) return db - da;
      if (da) return -1;
      if (db) return 1;
      return 0;
    });

    return jsonResponse({ rows, headers, summary: buildSummary(rows) });

  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

function buildSummary(rows) {
  let totalRows       = rows.length;
  let pickupDelayed   = 0;
  let pickupOnTime    = 0;
  let pickupPending   = 0;
  let deliveredCount  = 0;
  let deliveryPending = 0;
  let poRaised        = 0;
  let prRaised        = 0;
  let totalDelayDays  = 0;
  let delayedCount    = 0;
  const warehouseCounts = {};

  rows.forEach(row => {
    const wh = row["WH Name"] || "Unknown";
    warehouseCounts[wh] = (warehouseCounts[wh] || 0) + 1;

    const initiated = parseDate(row["Intatied pickup Date"]);
    const pickup    = parseDate(row["Pickup Date"]);

    if (!initiated || !pickup) {
      pickupPending++;
    } else {
      const diff = Math.round((pickup - initiated) / 86400000);
      if (diff > 0) {
        pickupDelayed++;
        totalDelayDays += diff;
        delayedCount++;
      } else {
        pickupOnTime++;
      }
    }

    const delivered = row["Delivred Date"];
    if (delivered && delivered !== "" && delivered.toUpperCase() !== "NA") {
      deliveredCount++;
    } else {
      deliveryPending++;
    }

    if (row["PO Staus"] && row["PO Staus"] !== "" && row["PO Staus"].toUpperCase() !== "NA") poRaised++;
    if (row["PR Staus"] && row["PR Staus"] !== "" && row["PR Staus"].toUpperCase() !== "NA") prRaised++;
  });

  return {
    totalRows, pickupDelayed, pickupOnTime, pickupPending,
    deliveredCount, deliveryPending, poRaised, prRaised,
    avgDelayDays: delayedCount > 0 ? Math.round(totalDelayDays / delayedCount) : 0,
    warehouseCounts
  };
}

function parseDate(str) {
  if (!str || str.toString().trim() === "" || str.toString().toUpperCase() === "NA") return null;
  const d = new Date(str);
  if (!isNaN(d.getTime())) return d;
  return null;
}

function jsonResponse(data) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// Run this manually in Apps Script editor to verify data
function testFetch() {
  Logger.log(buildResponse().getContent());
}
