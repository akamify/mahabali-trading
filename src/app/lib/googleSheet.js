// src/app/lib/googleSheet.js
import { google } from "googleapis";
import { formatISTDateTime } from "./dateTime";
import { cleanPhone10 } from "./phone";

const WEBINAR_RESUBMIT_GRACE_MS = 2 * 60 * 60 * 1000;

function normalizeStoredPhone(value) {
  try {
    return cleanPhone10(value);
  } catch {
    return "";
  }
}

function getWebinarCompletionTime(webinarISO) {
  const webinarTime = Date.parse(String(webinarISO || "").trim());
  if (!Number.isFinite(webinarTime)) return null;
  return webinarTime + WEBINAR_RESUBMIT_GRACE_MS;
}

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

// ✅ Append full row A:P and return inserted row number
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
    "no",                               // P sentDayLink
    "no",                               // M sent10Min
    "no",                               // N sentLive
    leadId || "",                       // O leadId
  ]];

  const res = await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "Sheet1!A:P",
    valueInputOption: "RAW",
    requestBody: { values },
  });

  // Example updatedRange: "Sheet1!A12:P12"
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
// Find a matching lead whose assigned webinar has not completed yet.
export async function findExistingLeadRow({ phone10, email }) {
  const p = String(phone10 || "").trim();
  const e = String(email || "")
    .trim()
    .toLowerCase();

  if (!p && !e) return null;

  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    // C=email, D=phone, I=webinarISO. Start at row 2 to skip headers.
    range: "Sheet1!A2:I",
  });

  const rows = res.data.values || [];
  for (let i = 0; i < rows.length; i++) {
    const rowEmail = String(rows[i]?.[2] || "")
      .trim()
      .toLowerCase();
    const rowPhone = normalizeStoredPhone(rows[i]?.[3]);
    const matchedBy = p && rowPhone === p ? "phone" : e && rowEmail === e ? "email" : null;
    const webinarCompletionTime = getWebinarCompletionTime(rows[i]?.[8]);

    if (matchedBy && (webinarCompletionTime === null || Date.now() < webinarCompletionTime)) {
      return {
        rowNumber: i + 2, // because we started at row 2
        matchedBy,
      };
    }
  }

  return null;
}

export async function markCell(rowNumber, columnLetter, value, sheetName = "Sheet1") {
  const sheets = await getSheets();

  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${sheetName}!${columnLetter}${rowNumber}`,
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
    range: "Sheet1!A:P",
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
  paymentId,
  orderId,
  invoiceNumber,
  invoiceDate,
}) {
  const sheets = await getSheets();

  const values = [[
    invoiceDate || formatISTDateTime(),
    name || "",
    email || "",
    phone || "",
    courseName || "Price Behaviour Mastery",
    String(price || ""),
    paymentStatus || "",
    paymentId || "",
    orderId || "",
    invoiceNumber || "",
  ]];

  const res = await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "Sheet2!A:J",
    valueInputOption: "RAW",
    requestBody: { values },
  });

  // Example updatedRange: "Sheet2!A12:J12"
  const updatedRange = res.data?.updates?.updatedRange || "";
  const match = updatedRange.match(/!A(\d+):/);
  const rowNumber = match ? Number(match[1]) : null;

  return { success: true, rowNumber };
}
