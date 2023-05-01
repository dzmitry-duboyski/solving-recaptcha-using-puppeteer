import puppeteer from "puppeteer";
const APIKEY = process.env.APIKEY;
import { Solver } from "2captcha-ts";
const solver = new Solver(APIKEY);

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1024 });

  await page.goto("https://2captcha.com/demo/recaptcha-v2");
  await page.waitForSelector(".g-recaptcha");

  // Extract the `sitekey` parameter from the page.
  const sitekey = await page.evaluate(() => {
    return document.querySelector(".g-recaptcha").getAttribute("data-sitekey");
  });

  // Get actual page url
  const pageurl = await page.url();

  // Submitting the captcha for solution to the service
  const res = await solver.recaptcha({
    pageurl: pageurl,
    googlekey: sitekey,
  });

  console.log(res);

  // Getting a captcha response including a captcha answer
  const captchaAnswer = res.data;

  // Use captcha answer
  const setAnswer = await page.evaluate((captchaAnswer) => {
    // It is not necessary to make this block visible, it is done here for clarity.
    document.querySelector("#g-recaptcha-response").style.display = "block";
    document.querySelector("#g-recaptcha-response").value = captchaAnswer;
  }, captchaAnswer);

  // Press the button to check the result.
  await page.click('button[type="submit"]');

  // Check result
  await page.waitForSelector("form div pre code");

  const resultBlockSelector = "form div pre code";
  let statusSolving = await page.evaluate((selector) => {
    return document.querySelector(selector).innerText;
  }, resultBlockSelector);

  statusSolving = JSON.parse(statusSolving);
  if (statusSolving.success) {
    console.log("Captcha solved successfully!!!");
  }

  await page.waitForTimeout(5000);
  browser.close();
})();
