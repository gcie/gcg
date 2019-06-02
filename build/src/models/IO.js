"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const readline = require("readline");
const stream_1 = require("stream");
class MutableIO extends readline.Interface {
    constructor(mutableStdout = new stream_1.Writable()) {
        super({ input: process.stdin, output: mutableStdout, terminal: true });
        this.muted = false;
        let _this = this;
        mutableStdout._write = function (chunk, encoding, callback) {
            if (!_this.muted)
                process.stdout.write(chunk, encoding);
            callback();
        };
    }
    questionPassword(query, callback) {
        this.question(query, (answer) => {
            this.muted = false;
            this.write('\n');
            callback(answer);
        });
        this.muted = true;
    }
    writeln(data, key) {
        this.write(data + '\n', key);
    }
}
const IO = new MutableIO();
exports.IO = IO;
