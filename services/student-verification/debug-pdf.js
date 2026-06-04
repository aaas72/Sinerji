/**
 * Debug script — extract and print raw text from the YÖK PDF
 */
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");

const PDF_PATH = path.resolve(__dirname, "../../tests/yok-ogrenci-belgesi-sorgulama (1).pdf");

(async () => {
  const buffer = fs.readFileSync(PDF_PATH);
  const parsed = await pdfParse(buffer);
  console.log("=== PDF TEXT START ===");
  console.log(parsed.text);
  console.log("=== PDF TEXT END ===");
  console.log("\nTotal characters:", parsed.text.length);
  console.log("Pages:", parsed.numpages);
})();
