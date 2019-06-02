import { AES, enc } from 'crypto-js';
import { writeFile } from 'fs';

export function saveCredentials(handle: string, password: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const handle_key = 'e81345433b17c3c1a2020ae34723a7e6';
        const password_key = '95ddcc8caa47a830d21717e58c1ab191';
        
        writeFile('./.secret', `${AES.encrypt(handle, handle_key).toString()}\n${AES.encrypt(password, password_key).toString()}`, (err) => {
            if(err) reject("Saving credentials failed");
            else resolve();
        });
    })
}