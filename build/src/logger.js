"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Logger {
    constructor(silent) {
        this.silent = silent;
    }
    log(...messages) {
        if (!this.silent) {
            console.log(...messages);
        }
    }
    error(...messages) {
        console.error(...messages);
    }
    callback(message, success, failure) {
        return (err) => {
            if (err) {
                this.error(err.message);
                if (failure) {
                    failure();
                }
            }
            else {
                this.log(message);
                if (success) {
                    success();
                }
            }
        };
    }
}
exports.Logger = Logger;
