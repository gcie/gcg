"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_js_1 = require("crypto-js");
const fs_1 = require("fs");
function saveCredentials(handle, password) {
    return new Promise((resolve, reject) => {
        const handle_key = 'e81345433b17c3c1a2020ae34723a7e6';
        const password_key = '95ddcc8caa47a830d21717e58c1ab191';
        fs_1.writeFile('./.secret', `${crypto_js_1.AES.encrypt(handle, handle_key).toString()}\n${crypto_js_1.AES.encrypt(password, password_key).toString()}`, (err) => {
            if (err)
                reject("Saving credentials failed");
            else
                resolve();
        });
    });
}
exports.saveCredentials = saveCredentials;
