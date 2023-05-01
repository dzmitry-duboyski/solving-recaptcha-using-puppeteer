import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const [page] = await browser.pages();

  await page.goto("https://2captcha.com/demo/recaptcha-v2");
  await page.waitForTimeout(5000);

  browser.close();
})();
