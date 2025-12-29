const fs = require("fs");
const path = require("path");
const pdf = require("pdf-parse"); // ✅ CORRECT
const mammoth = require("mammoth");
const xlsx = require("xlsx");

/**
 * Extracts readable text from supported file types
 */
async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".pdf") {
    return extractFromPDF(filePath);
  }

  if (ext === ".docx") {
    return extractFromDocx(filePath);
  }

  if (ext === ".txt") {
    return extractFromTxt(filePath);
  }

  if (ext === ".xlsx") {
    return extractFromExcel(filePath);
  }

  throw new Error(`Unsupported file type: ${ext}`);
}

/* ================= PDF ================= */

async function extractFromPDF(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdf(buffer); // ✅ THIS IS CORRECT
  return cleanText(data.text);
}

/* ================= DOCX ================= */

async function extractFromDocx(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  return cleanText(result.value);
}

/* ================= TXT ================= */

function extractFromTxt(filePath) {
  return cleanText(fs.readFileSync(filePath, "utf-8"));
}

/* ================= XLSX ================= */

function extractFromExcel(filePath) {
  const workbook = xlsx.readFile(filePath);
  let content = "";

  workbook.SheetNames.forEach(sheet => {
    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheet], { header: 1 });
    rows.forEach(row => {
      content += row.join(" ") + "\n";
    });
  });

  return cleanText(content);
}

/* ================= CLEAN TEXT ================= */

function cleanText(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .replace(/[^\x20-\x7E\n]/g, "")
    .trim();
}

module.exports = { extractText };
