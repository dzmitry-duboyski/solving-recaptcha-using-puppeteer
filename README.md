# Sample code to automate reCAPTCHA solution with Puppeteer

## Description

This code example demonstrates how to automate solving a reCAPTCHA using the [Puppeteer](https://pptr.dev/) library. To captcha solving, this example uses the [2captcha.com](https://2captcha.com/?from=16653706) service. This example solves the captcha located on the page https://2captcha.com/demo/recaptcha-v2. You need to have a [2captcha.com](https://2captcha.com/?from=16653706) account for the example to work.

## How to start:

### Cloning

`git clone https://github.com/dzmitry-duboyski/solving-recaptcha-using-puppeteer.git`

### Install dependencies

`npm install`

### Set your APIKEY in `.env` file

> `APIKEY` is specified in the personal account [2captcha.com](https://2captcha.com/?from=16653706). Before copying the `APIKEY`, check the selected role, the **"developer"** role must be installed in the personal account.

### Start

`npm run start`

## How it works

```js
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
```

The source code is available in the file [index.js](/index.js)

## Additional information:

- [reCAPTCHA demo page](https://2captcha.com/demo/recaptcha-v2?from=16653706).
- [Documentation for reCAPTCHA solution in 2captcha service](https://2captcha.com/2captcha-api#solving_recaptchav2_new?from=16653706).
- [How to bypass reCAPTCHA V2](https://2captcha.com/p/recaptcha_v2/?from=16653706)
- [Bypassing reCAPTCHA V2 on Google Search](https://2captcha.com/blog/bypassing-recaptcha-v2-on-google-search?from=16653706)
- [Update on Google Search reCAPTCHA V2](https://2captcha.com/blog/google-sepr-recaptcha-june-2022?from=16653706)
