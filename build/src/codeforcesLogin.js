"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CFData_1 = require("./models/CFData");
const crypto_js_1 = require("crypto-js");
const fs_1 = require("fs");
const puppeteer_core_1 = require("puppeteer-core");
const IO_1 = require("./models/IO");
const handle_key = 'e81345433b17c3c1a2020ae34723a7e6';
const password_key = '95ddcc8caa47a830d21717e58c1ab191';
async function codeforcesLogin(cmd) {
    let data = new CFData_1.CFData();
    Promise.resolve(data)
        .then(launchBrowser)
        .then(loadCredentials)
        .then(resolveLogin)
        .then(getMetadata)
        .then((data) => IO_1.IO.writeln("Successfully logged in as " + data.handle))
        .catch(console.log)
        .finally(() => process.exit(0));
}
exports.codeforcesLogin = codeforcesLogin;
async function codeforcesSetLogin(handle, cmd) {
    let data = new CFData_1.CFData(handle);
    Promise.resolve(data)
        .then(launchBrowser)
        .then(resolveHandle)
        .then(resolvePassword)
        .then(resolveLogin)
        .then(getMetadata)
        .then(saveCredentials)
        .then(loadCredentials)
        .then((data) => { IO_1.IO.writeln("Successfully logged in as " + data.handle); })
        .catch(console.log)
        .finally(() => process.exit(0));
}
exports.codeforcesSetLogin = codeforcesSetLogin;
async function launchBrowser(data) {
    const browser = await puppeteer_core_1.launch({ executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe' });
    data.page = await browser.newPage();
    if (!data.page)
        throw "Opening chrome failed";
    return data;
}
async function resolveLogin(data) {
    await data.page.goto('https://codeforces.com/enter');
    await data.page.type('#handleOrEmail', data.handle);
    await data.page.type('#password', data.password);
    await data.page.click('.submit');
    await data.page.waitForNavigation({ waitUntil: 'networkidle0' });
    if (data.page.url() == 'https://codeforces.com/') {
        return data;
    }
    else {
        throw 'Login failed';
    }
}
async function getMetadata(data) {
    const cookies = await data.page.cookies();
    const xuser_cookie = cookies.find(cookie => cookie.name == 'X-User-Sha1');
    if (!xuser_cookie)
        throw "You are not logged in";
    data.xuser_cookie = xuser_cookie.value;
    const xcsrf_token = await data.page.evaluate(() => Array.from(document.querySelectorAll('meta')).find(meta => meta.name == "X-Csrf-Token"));
    data.xcsrf_token = xcsrf_token.content;
    return data;
}
function resolveHandle(data) {
    return new Promise((resolve, _) => {
        if (data.handle) {
            resolve(data);
        }
        else {
            IO_1.IO.question("Handle: ", (handle) => {
                data.handle = handle;
                resolve(data);
            });
        }
    });
}
function resolvePassword(data) {
    return new Promise((resolve, _) => {
        IO_1.IO.questionPassword("Password: ", (password) => {
            data.password = password;
            resolve(data);
        });
    });
}
function saveCredentials(data) {
    return new Promise((resolve, reject) => {
        fs_1.writeFile(__dirname + '/../.secret', `${crypto_js_1.AES.encrypt(data.handle, handle_key).toString()}\n${crypto_js_1.AES.encrypt(data.password, password_key).toString()}`, (err) => {
            if (err)
                reject("Saving credentials failed");
            else
                resolve(data);
        });
    });
}
function loadCredentials(data) {
    return new Promise((resolve, reject) => {
        fs_1.readFile(__dirname + '/../.secret', (err, secret) => {
            if (err)
                reject("Loading credentials failed");
            else {
                let [encrypted_handle, encrypted_password] = secret.toString().split('\n');
                data.handle = crypto_js_1.AES.decrypt(encrypted_handle, handle_key).toString(crypto_js_1.enc.Utf8);
                data.password = crypto_js_1.AES.decrypt(encrypted_password, password_key).toString(crypto_js_1.enc.Utf8);
                resolve(data);
            }
        });
    });
}
codeforcesSetLogin(undefined);
