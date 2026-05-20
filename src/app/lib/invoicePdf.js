import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { formatISTDateTime } from "./dateTime";

function safe(value, fallback = "-") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function safePdfCurrency(value, fallback = "INR 999") {
  const text = safe(value, fallback);
  // Standard PDF fonts (WinAnsi) do not support the Rupee symbol.
  return text.replaceAll("₹", "INR ");
}

function parseAmountToNumber(val, fallback = 999) {
  if (val == null) return Number(fallback);
  if (typeof val === "number") return val;
  const cleaned = String(val).replace(/[^0-9.-]/g, "");
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : Number(fallback);
}

function formatForPdf(num) {
  return `INR ${Number(num || 0).toFixed(2)}`;
}

export async function buildCourseInvoicePdf({
  name,
  email,
  phone,
  paymentId,
  orderId,
  amount,
  courseName,
  gstRate: gstRateParam,
  gstNumber: gstNumberParam,
  invoiceNumber: invoiceNumberParam,
  invoiceDate: invoiceDateParam,
}) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();
  const margin = 40;
  let y = height - margin;

  // Header bar
  page.drawRectangle({
    x: 0,
    y: height - 120,
    width,
    height: 120,
    color: rgb(0.11, 0.64, 0.27),
  });
  page.drawText("MAHABALI EDUCATION", {
    x: margin,
    y: height - 56,
    size: 18,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  page.drawText("Payment Invoice", {
    x: margin,
    y: height - 84,
    size: 26,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  y = height - 155;
  const invoiceDate = invoiceDateParam || formatISTDateTime();
  const invoiceNumber = invoiceNumberParam || `INV-${Date.now()}`;

  page.drawText(`Invoice No: ${invoiceNumber}`, {
    x: margin,
    y,
    size: 11,
    font: fontBold,
    color: rgb(0.1, 0.12, 0.16),
  });
  page.drawText(`Invoice Date: ${invoiceDate}`, {
    x: width - 210,
    y,
    size: 11,
    font: fontBold,
    color: rgb(0.1, 0.12, 0.16),
  });

  // Seller GST number placed below invoice number (if provided)
  const gstNumber = gstNumberParam ?? process.env.GST_NUMBER ?? "";
  if (gstNumber) {
    page.drawText(`GSTIN: ${safe(gstNumber)}`, {
      x: margin,
      y: y - 16,
      size: 10,
      font: fontRegular,
      color: rgb(0.23, 0.27, 0.33),
    });
    y -= 18;
  }

  y -= 30;
  page.drawText("Billed To", {
    x: margin,
    y,
    size: 12,
    font: fontBold,
    color: rgb(0.11, 0.64, 0.27),
  });
  y -= 18;
  page.drawText(`Name: ${safe(name)}`, { x: margin, y, size: 11, font: fontRegular, color: rgb(0.13, 0.14, 0.16) });
  y -= 16;
  page.drawText(`Email: ${safe(email)}`, { x: margin, y, size: 11, font: fontRegular, color: rgb(0.13, 0.14, 0.16) });
  y -= 16;
  page.drawText(`Phone: ${safe(phone)}`, { x: margin, y, size: 11, font: fontRegular, color: rgb(0.13, 0.14, 0.16) });

  y -= 30;
  // Item table header
  page.drawRectangle({
    x: margin,
    y: y - 4,
    width: width - margin * 2,
    height: 24,
    color: rgb(0.94, 0.97, 0.95),
  });
  page.drawText("Description", { x: margin + 8, y: y + 4, size: 11, font: fontBold, color: rgb(0.1, 0.12, 0.16) });
  page.drawText("Amount", { x: width - 120, y: y + 4, size: 11, font: fontBold, color: rgb(0.1, 0.12, 0.16) });

  y -= 30;

  // Compute amounts: course base, GST and total
  const courseBase = parseAmountToNumber(amount ?? process.env.COURSE_AMOUNT_INR ?? 999, 999);
  const gstRate = Number(gstRateParam ?? process.env.GST_RATE ?? 18);
  const gstAmount = Number((courseBase * gstRate / 100).toFixed(2));
  const totalPaid = Number((courseBase + gstAmount).toFixed(2));

  page.drawText(`${safe(courseName, "Price Behaviour Mastery")} Course Purchase`, {
    x: margin + 8,
    y: y + 4,
    size: 11,
    font: fontRegular,
    color: rgb(0.13, 0.14, 0.16),
  });
  page.drawText(formatForPdf(courseBase), {
    x: width - 120,
    y: y + 4,
    size: 11,
    font: fontBold,
    color: rgb(0.13, 0.14, 0.16),
  });

  // GST row
  y -= 26;
  page.drawText(`GST (${gstRate}%)`, { x: margin + 8, y: y + 4, size: 11, font: fontRegular, color: rgb(0.13, 0.14, 0.16) });
  page.drawText(formatForPdf(gstAmount), { x: width - 120, y: y + 4, size: 11, font: fontRegular, color: rgb(0.13, 0.14, 0.16) });

  // Totals
  y -= 30;
  page.drawLine({
    start: { x: margin, y: y + 18 },
    end: { x: width - margin, y: y + 18 },
    thickness: 1,
    color: rgb(0.9, 0.92, 0.94),
  });
  page.drawText("Total Paid", {
    x: width - 210,
    y: y,
    size: 13,
    font: fontBold,
    color: rgb(0.1, 0.12, 0.16),
  });
  page.drawText(formatForPdf(totalPaid), {
    x: width - 120,
    y: y,
    size: 13,
    font: fontBold,
    color: rgb(0.11, 0.64, 0.27),
  });

  y -= 44;
  page.drawText(`Payment ID: ${safe(paymentId)}`, {
    x: margin,
    y,
    size: 10,
    font: fontRegular,
    color: rgb(0.23, 0.27, 0.33),
  });
  y -= 14;
  page.drawText(`Order ID: ${safe(orderId)}`, {
    x: margin,
    y,
    size: 10,
    font: fontRegular,
    color: rgb(0.23, 0.27, 0.33),
  });

  // Footer
  page.drawText("Thank you for your purchase. Wishing you successful trading ahead!", {
    x: margin,
    y: 80,
    size: 10,
    font: fontBold,
    color: rgb(0.11, 0.64, 0.27),
  });
  page.drawText("Team Mahabali Education", {
    x: margin,
    y: 62,
    size: 10,
    font: fontRegular,
    color: rgb(0.23, 0.27, 0.33),
  });

  const pdfBytes = await pdfDoc.save();
  const contentBase64 = Buffer.from(pdfBytes).toString("base64");
  const fileName = `invoice-${safe(paymentId, Date.now())}.pdf`;

  return { contentBase64, fileName, invoiceNumber, invoiceDate };
}
