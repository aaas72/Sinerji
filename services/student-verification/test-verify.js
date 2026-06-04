/**
 * Quick test script — sends the real YÖK PDF to the verification endpoint
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const PDF_PATH = path.resolve(__dirname, "../../tests/yok-ogrenci-belgesi-sorgulama (1).pdf");
const API_KEY = "ea390e48c4638df2f35a14cd7bd1f7808c9670d0b3996f8c0993aed7d104b2c5";
const ENDPOINT = "http://localhost:4000/api/verify-student";

// Build multipart form data manually
const boundary = "----FormBoundary" + Date.now();
const fileBuffer = fs.readFileSync(PDF_PATH);
const fileName = path.basename(PDF_PATH);

const header = Buffer.from(
  `--${boundary}\r\n` +
  `Content-Disposition: form-data; name="document"; filename="${fileName}"\r\n` +
  `Content-Type: application/pdf\r\n\r\n`
);
const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
const body = Buffer.concat([header, fileBuffer, footer]);

const url = new URL(ENDPOINT);
const options = {
  hostname: url.hostname,
  port: url.port,
  path: url.pathname,
  method: "POST",
  headers: {
    "Content-Type": `multipart/form-data; boundary=${boundary}`,
    "Content-Length": body.length,
    "x-api-key": API_KEY,
  },
};

console.log("Sending PDF to verification endpoint...\n");

const req = http.request(options, (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    console.log(`Status: ${res.statusCode}`);
    try {
      const json = JSON.parse(data);
      console.log("\nResponse:");
      console.log(JSON.stringify(json, null, 2));
    } catch {
      console.log("Raw response:", data);
    }
  });
});

req.on("error", (err) => {
  console.error("Request failed:", err.message);
});

req.write(body);
req.end();
