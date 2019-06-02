import { CFData } from './models/CFData';
import { CommanderStatic } from 'commander';
import { AES, enc } from 'crypto-js';
import { readFile, writeFile } from 'fs';
import { launch } from 'puppeteer-core';
import { IO } from './models/IO';

const handle_key = 'e81345433b17c3c1a2020ae34723a7e6';
const password_key = '95ddcc8caa47a830d21717e58c1ab191';

export async function codeforcesLogin(cmd?: CommanderStatic) {
    let data = new CFData();
    Promise.resolve(data)
        .then(launchBrowser)
        .then(loadCredentials)
        .then(resolveLogin)
        .then(getMetadata)
        .then((data) => IO.writeln("Successfully logged in as " + data.handle))
        .catch(console.log)
        .finally(() => process.exit(0));
}

export async function codeforcesSetLogin(handle: string | undefined, cmd?: CommanderStatic) {
    let data = new CFData(handle);
    Promise.resolve(data)
        .then(launchBrowser)
        .then(resolveHandle)
        .then(resolvePassword)
        .then(resolveLogin)
        .then(getMetadata)
        .then(saveCredentials)
        .then(loadCredentials)
        .then((data) => { IO.writeln("Successfully logged in as " + data.handle); })
        .catch(console.log)
        .finally(() => process.exit(0));
}

async function launchBrowser(data: CFData): Promise<CFData> {
    const browser = await launch({executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'}); // TODO: remove hardcoding of chrome path
    data.page = await browser.newPage();
    if (!data.page) throw "Opening chrome failed";
    return data;
}

async function resolveLogin(data: CFData): Promise<CFData> {
    await data.page!.goto('https://codeforces.com/enter');
    await data.page!.type('#handleOrEmail', data.handle!);
    await data.page!.type('#password', data.password!);
    await data.page!.click('.submit');
    await data.page!.waitForNavigation({waitUntil: 'networkidle0'});
    if (data.page!.url() == 'https://codeforces.com/') {
        return data;
    } else {
        throw 'Login failed';
    }
}

async function getMetadata(data: CFData): Promise<CFData> {
    const cookies = await data.page!.cookies();
    const xuser_cookie = cookies.find(cookie => cookie.name == 'X-User-Sha1');
    if(!xuser_cookie) throw "You are not logged in";
    data.xuser_cookie = xuser_cookie.value;
    const xcsrf_token = await data.page!.evaluate(() => Array.from(document.querySelectorAll('meta')).find(meta => meta.name == "X-Csrf-Token"));
    data.xcsrf_token = xcsrf_token!.content;
    return data;
}

function resolveHandle(data: CFData): Promise<CFData> {
    return new Promise((resolve, _) => {
        if(data.handle) {
            resolve(data);
        } else {
            IO.question("Handle: ", (handle) => {
                data.handle = handle;
                resolve(data);
            });
        }
    });
}

function resolvePassword(data: CFData): Promise<CFData> {
    return new Promise((resolve, _) => {
        IO.questionPassword("Password: ", (password) => {
            data.password = password;
            resolve(data);
        });
    });
}

function saveCredentials(data: CFData): Promise<CFData> {
    return new Promise((resolve, reject) => {
        writeFile(__dirname + '/../.secret', `${AES.encrypt(data.handle, handle_key).toString()}\n${AES.encrypt(data.password, password_key).toString()}`, (err) => {
            if(err) reject("Saving credentials failed");
            else resolve(data);
        });
    })
}

function loadCredentials(data: CFData): Promise<CFData> {
    return new Promise((resolve, reject) => {
        readFile(__dirname + '/../.secret', (err, secret) => {
            if(err) reject("Loading credentials failed");
            else {
                let [encrypted_handle, encrypted_password] = secret.toString().split('\n');
                data.handle = AES.decrypt(encrypted_handle, handle_key).toString(enc.Utf8);
                data.password = AES.decrypt(encrypted_password, password_key).toString(enc.Utf8);
                resolve(data);
            }
        });
    });
}

codeforcesSetLogin(undefined);