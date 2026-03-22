// ============================================================
// GT PICKUP DASHBOARD — Google Apps Script (Code.gs)
// ============================================================
// HOW TO DEPLOY:
// 1. Open your Google Sheet
// 2. Go to Extensions > Apps Script
// 3. Delete any existing code, paste this entire file
// 4. Click "Deploy" > "New deployment"
//    - Type: Web App
//    - Execute as: Me
//    - Who has access: Anyone
// 5. Click "Deploy" → copy the Web App URL
// 6. On your dashboard, paste that URL into the setup banner
// ============================================================

const SHEET_NAME = "GT Pikcup";

function doGet(e) {
  // Allow CORS so the browser dashboard can call this
  const output = buildResponse();
  return output;
}

function buildResponse() {
  try {
    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      return jsonResponse({ error: "Sheet not found: " + SHEET_NAME });
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

    return jsonResponse({ rows, headers, summary: buildSummary(rows) });

  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

function buildSummary(rows) {
  let totalRows      = rows.length;
  let pickupDelayed  = 0;
  let pickupOnTime   = 0;
  let pickupPending  = 0;
  let deliveredCount = 0;
  let deliveryPending = 0;
  let poRaised       = 0;
  let prRaised       = 0;
  let totalDelayDays = 0;
  let delayedCount   = 0;
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
  if (!str || str === "" || str.toUpperCase() === "NA") return null;
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
