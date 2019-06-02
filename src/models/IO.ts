import readline = require('readline');
import { Writable } from 'stream';

class MutableIO extends readline.Interface {
    muted: boolean = false;

    constructor(mutableStdout = new Writable()) {
        super({input: process.stdin, output: mutableStdout, terminal: true});
        let _this = this;
        mutableStdout._write = function(chunk, encoding, callback) {
            if (!_this.muted) process.stdout.write(chunk, encoding);
            callback();
        }
    }

    questionPassword(query: string, callback: (answer: string) => void) {
        this.question(query, (answer) => {
            this.muted = false;
            this.write('\n');
            callback(answer);
        });
        this.muted = true;
    }

    writeln(data: string | Buffer, key?: readline.Key | undefined): void {
        this.write(data + '\n', key);
    }
}

const IO = new MutableIO();

export { IO };