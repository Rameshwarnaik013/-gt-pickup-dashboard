# GT Pickup Dashboard

A live dashboard for the **GT Pikcup** Google Sheet — shows pickup delays, delivery status, warehouse breakdowns, and more. Hosted on Vercel, data served via Google Apps Script.

---

## Project Structure

```
gt-pickup-dashboard/
├── index.html     ← The dashboard (entire frontend)
├── Code.gs        ← Google Apps Script (paste into your sheet)
├── vercel.json    ← Vercel deployment config
├── .gitignore
└── README.md
```

---

## Step 1 — Set up the Google Apps Script

1. Open your Google Sheet
2. Go to **Extensions → Apps Script**
3. Delete any existing code
4. Copy the contents of `Code.gs` and paste it in
5. Click **Save** (💾)
6. Click **Deploy → New Deployment**
   - Type: **Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Click **Deploy**
8. **Copy the Web App URL** — you'll need it in Step 3

> ⚠️ If you update `Code.gs` later, you must create a **New Deployment** (not update existing) for changes to take effect.

---

## Step 2 — Push to GitHub

```bash
# In your terminal, navigate to this folder
cd gt-pickup-dashboard

# Initialise git
git init

# Add all files
git add .

# Commit
git commit -m "Initial dashboard"

# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/gt-pickup-dashboard.git
git branch -M main
git push -u origin main
```

---

## Step 3 — Deploy on Vercel

### Option A — Vercel Dashboard (easiest)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New → Project**
3. Select your `gt-pickup-dashboard` repository
4. Leave all settings as default
5. Click **Deploy**
6. Vercel gives you a live URL like `https://gt-pickup-dashboard.vercel.app`

### Option B — Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## Step 4 — Connect the Dashboard to Your Sheet

1. Open your Vercel URL in a browser
2. The yellow setup banner appears — paste your Apps Script Web App URL
3. Click **Connect**
4. The URL is saved in your browser (localStorage) — you only do this once per device

---

## Refreshing Data

- Click the **↻ Refresh** button in the top right at any time
- Data is always pulled live from Google Sheets — no caching

---

## What the Dashboard Shows

| Feature | Description |
|---|---|
| **Pickup Delay Flag** | Red chip (e.g. "▲ 7d late") if Pickup Date > Initiated Date |
| **On-Time / Pending** | Green tick or grey chip |
| **KPI Cards** | Total, Delayed, On-Time, Avg Delay, Delivered, PO Raised |
| **Pickup Status Donut** | Split of delayed / on-time / pending |
| **Delivery Status Donut** | Delivered vs pending |
| **Warehouse Bar Chart** | Pickup count per warehouse |
| **Sortable Table** | Click any column header to sort |
| **Filters** | By warehouse, pickup status, or free-text search |

---

## Troubleshooting

**"Failed to load data"**
- Make sure the Apps Script is deployed with **Who has access: Anyone**
- Check that the sheet tab name is exactly `GT Pikcup` (with the typo, matching your sheet)

**Data looks stale**
- In Apps Script, you must deploy a **New Deployment** after any code changes

**CORS errors in console**
- This happens if the Apps Script URL is wrong or not deployed as "Anyone"
- Re-deploy and paste the new URL in the dashboard setup banner
