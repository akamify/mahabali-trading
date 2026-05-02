// src/app/lib/googleSheet.js
import { google } from "googleapis";
import { formatISTDateTime } from "./dateTime";

function getAuthClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return auth.getClient();
}

async function getSheets() {
  const client = await getAuthClient();
  return google.sheets({ version: "v4", auth: client });
}

// ✅ Append full row A:O and return inserted row number
export async function saveToSheet({
  name,
  email,
  phone,
  source,
  webinarDay,
  webinarDate,
  webinarTime,
  webinarISO,
  leadId,
}) {
  const sheets = await getSheets();

  const values = [[
    formatISTDateTime(), // A Timestamp
    name,                               // B
    email,                              // C
    phone,                              // D (10 digit only)
    source,                             // E
    webinarDay || "",                   // F
    webinarDate || "",                  // G
    webinarTime || "",                  // H
    webinarISO || "",                   // I
    "no",                               // J sentConfirmation
    "no",                               // K sent2Day
    "no",                               // L sentMorning
    "no",                               // M sent10Min
    "no",                               // N sentLive
    leadId || "",                       // O leadId
  ]];

  const res = await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "Sheet1!A:O",
    valueInputOption: "RAW",
    requestBody: { values },
  });

  // Example updatedRange: "Sheet1!A12:O12"
  const updatedRange = res.data?.updates?.updatedRange || "";
  const match = updatedRange.match(/!A(\d+):/);
  const rowNumber = match ? Number(match[1]) : null;

  return { success: true, rowNumber };
}

// Find row number by leadId stored in column O
export async function findRowByLeadId(leadId) {
  if (!leadId) return null;
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "Sheet1!O:O",
  });

  const rows = res.data.values || [];
  // rows[0] is header
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i]?.[0] || "") === String(leadId)) {
      return i + 1; // sheet row number
    }
  }
  return null;
}

// ✅ Mark a single cell (e.g. J12 = "yes")
// Find existing lead row by phone/email (prevents duplicate submissions)
export async function findExistingLeadRow({ phone10, email }) {
  const p = String(phone10 || "").trim();
  const e = String(email || "")
    .trim()
    .toLowerCase();

  if (!p && !e) return null;

  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    // C=email, D=phone. Start at row 2 to skip headers.
    range: "Sheet1!C2:D",
  });

  const rows = res.data.values || [];
  for (let i = 0; i < rows.length; i++) {
    const rowEmail = String(rows[i]?.[0] || "")
      .trim()
      .toLowerCase();
    const rowPhone = String(rows[i]?.[1] || "").trim();

    if ((p && rowPhone === p) || (e && rowEmail === e)) {
      return {
        rowNumber: i + 2, // because we started at row 2
        matchedBy: p && rowPhone === p ? "phone" : "email",
      };
    }
  }

  return null;
}

export async function markCell(rowNumber, columnLetter, value) {
  const sheets = await getSheets();

  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `Sheet1!${columnLetter}${rowNumber}`,
    valueInputOption: "RAW",
    requestBody: { values: [[value]] },
  });

  return { success: true };
}

// ✅ Read all leads (rows after header)
export async function readAllLeads() {
  const sheets = await getSheets();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "Sheet1!A:O",
  });

  const rows = res.data.values || [];
  return rows.slice(1); // remove header row
}

export async function saveCoursePurchaseToSheet2({
  name,
  email,
  phone,
  courseName,
  price,
  paymentStatus,
}) {
  const sheets = await getSheets();

  const values = [[
    formatISTDateTime(),
    name || "",
    email || "",
    phone || "",
    courseName || "Price Behaviour Mastery",
    String(price || ""),
    paymentStatus || "",
  ]];

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "Sheet2!A:G",
    valueInputOption: "RAW",
    requestBody: { values },
  });

  return { success: true };
}
