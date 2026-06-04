/**
 * Debug script — navigate to e-Devlet belge dogrulama and dump the HTML
 * to understand the actual page structure and form field selectors.
 */
const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    console.log("Navigating to e-Devlet...");
    await page.goto("https://www.turkiye.gov.tr/belge-dogrulama", {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    console.log("Typing barcode...");
    await page.type("#sorgulananBarkod", "YOKOGB44VSD8EJQ7LS");
    
    console.log("Submitting step 1...");
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2" }),
      page.click(".submitButton")
    ]);

    console.log("Typing TC number in step 2...");
    // Use the actual TC number extracted previously from the PDF
    await page.type("#ikinciAlan", "99063773082");
    
    console.log("Submitting step 2...");
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2" }),
      page.click(".submitButton")
    ]);

    console.log("Accepting terms in step 3...");
    const checkbox = await page.waitForSelector("#chkOnay", { visible: true });
    await page.evaluate((el) => el.click(), checkbox);
    
    console.log("Submitting step 3...");
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2" }),
      page.click(".submitButton")
    ]);

    console.log("Step 4 Page title:", await page.title());
    console.log("Step 4 Page URL:", page.url());

    // Wait a bit for the result to fully render
    await new Promise(r => setTimeout(r, 2000));

    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log("\n=== STEP 4 VISIBLE TEXT (first 3000 chars) ===");
    console.log(bodyText.substring(0, 3000));

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await browser.close();
  }
})();
