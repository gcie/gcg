"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer = require("puppeteer-core");
async function login() {
}
(async () => {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe' });
    console.log("Creating new page...");
    const page = await browser.newPage();
    console.log("Loading cf...");
    await page.goto('https://codeforces.com/enter');
    const form = await page.$('#enterForm');
    await page.type('#handleOrEmail', 'grzechu1997@gmail.com');
    await page.type('#password', 'T@()24-cftest');
    await page.click('.submit');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    console.log("Getting cookies...");
    const cookies = await page.cookies();
    const xuser_cookie = cookies.find(cookie => cookie.name == 'X-User-Sha1');
    if (xuser_cookie)
        console.log(xuser_cookie);
    const metas = await page.evaluate(() => Array.from(document.querySelectorAll('meta')).find(meta => meta.name == "X-Csrf-Token").content);
    console.log(metas);
    console.log(page.url());
    await browser.close();
})();
