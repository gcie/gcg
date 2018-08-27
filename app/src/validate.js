"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const stream_1 = require("stream");
class Validator {
    constructor(args) {
        this.args = args;
        this.programName = args._[1];
        this.sourcePath = this.programName + '.cpp';
        this.programPath = './' + this.programName;
        this.successes = this.failures = 0;
        this.taskTestsFolderPath = args.f || `tests/${this.programName}`;
    }
    start() {
        if (!fs_1.existsSync(this.sourcePath)) {
            console.error("\x1b[31m%s\x1b[0m%s", 'ERROR:', "Could not find file: " + this.sourcePath);
            process.exit();
        }
        if (this.args.compile) {
            child_process_1.execFile('g++', ['-std=c++17', this.sourcePath, '-o', this.programName], (error, stdout, stderr) => {
                if (error) {
                    console.error("\x1b[31m%s\x1b[0m %s", "COMPILE ERROR:", stderr);
                    process.exit();
                }
                this.checkFile();
            });
        }
        else {
            if (!fs_1.existsSync(this.programName) && !fs_1.existsSync(this.programName + '.exe')) { // FIXME: Check OS and resolve correct file
                console.error("\x1b[31m%s\x1b[0m %s %s", 'ERROR:', "Could not find file: " + this.programName + '.', "Maybe remove 'no-compile' flag?");
                process.exit();
            }
            this.checkFile();
        }
    }
    checkFile() {
        if (this.args.f) {
            fs_1.readdir(`./${this.args.f}`, (err, items) => {
                if (!items) {
                    console.error(`\x1b[31mERROR: \x1b[0mCould not find directory: './${this.args.f}`);
                    process.exit();
                }
                if (this.args.t) {
                    if (!fs_1.existsSync(`./${this.args.f}/${this.args.t}.in`)) {
                        console.error("\x1b[31m%s\x1b[0m %s %s", 'ERROR:', `Could not find test: "${this.args.t}.in".`);
                        process.exit();
                    }
                    this.validateProgram(this.args.t, `./${this.args.f}`);
                }
                else {
                    items.forEach(item => {
                        if (item.endsWith('.in')) {
                            this.validateProgram(item.replace(/\.[^/.]+$/, ""), `./${this.args.f}`);
                        }
                    });
                }
            });
        }
        else {
            fs_1.readdir(`./tests`, (err, items) => {
                if (err || !items || items.length == 0) {
                    return;
                }
                if (this.args.t) {
                    if (!fs_1.existsSync(`./tests/${this.args.t}.in`))
                        return;
                    this.validateProgram(this.args.t, `./tests`);
                }
                else {
                    items.forEach(item => {
                        if (item.endsWith('.in') && item.startsWith(this.programName)) {
                            this.validateProgram(item.replace(/\.[^/.]+$/, ""), `./tests`);
                        }
                    });
                }
            });
            fs_1.readdir(`./tests/${this.programName}`, (err, items) => {
                if (err || !items || items.length == 0) {
                    return;
                }
                if (this.args.t) {
                    if (!fs_1.existsSync(`./tests/${this.programName}/${this.args.t}.in`))
                        return;
                    this.validateProgram(this.args.t, `tests/${this.programName}/${this.args.t}`);
                }
                else {
                    items.forEach(item => {
                        if (item.endsWith('.in')) {
                            this.validateProgram(item.replace(/\.[^/.]+$/, ""), `./tests/${this.programName}`);
                        }
                    });
                }
            });
        }
    }
    validateProgram(testName, testPath) {
        var child = child_process_1.execFile(this.programPath, (error, stdout, stderr) => {
            if (error) {
                console.error("\x1b[31m%s\x1b[0m %s\n", 'ERROR:', stderr ? stderr : `Could not execute file: ${this.programPath}`, error.message);
                return;
            }
            var testOutExt;
            if (fs_1.existsSync(`${testPath}/${testName}.out`)) {
                testOutExt = '.out';
            }
            else {
                testOutExt = '.ans';
            }
            const testTxtPath = `${testPath}/${testName}${testOutExt}`;
            const testValName = this.programName + '_out';
            const testValPath = `${testPath}/${testValName}`;
            if (fs_1.existsSync(testTxtPath)) {
                var destout = fs_1.readFileSync(testTxtPath).toString();
                if (stdout.trim() == destout.trim()) {
                    console.log(`\x1b[33mTest ${testName}:\x1b[0m \x1b[32mSUCCESS\x1b[0m`);
                    this.successes++;
                }
                else {
                    console.log(`\x1b[33mTest ${testName}:\x1b[0m \x1b[31mINVALID ANSWER\x1b[0m\n\x1b[33m### Expected:\x1b[0m\n${destout.trim()}\n\x1b[33m### Got:     \x1b[0m\n${stdout.trim()}`);
                    this.failures++;
                }
            }
            else if (true /* existsSync(testValPath + '.exe') */) {
                var validator = child_process_1.execFile(testValPath, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`\x1b[33mTest ${testName}:\x1b[0m \x1b[31mERROR:\x1b[0m %s`, stderr ? stderr : `Could not execute file: ${testValPath}`);
                        this.failures++;
                    }
                    else if (stdout.trim() == '') {
                        console.log(`\x1b[33mTest ${testName}:\x1b[0m \x1b[32mSUCCESS\x1b[0m`);
                        this.successes++;
                    }
                    else {
                        console.log(`\x1b[33mTest ${testName}:\x1b[0m \x1b[31mINVALID ANSWER\x1b[0m\n\x1b[33m### Checker result: \x1b[0m${stdout.trim()}`);
                        this.failures++;
                    }
                });
                const valStream = new stream_1.Readable();
                valStream._read = () => { };
                valStream.push(fs_1.readFileSync(`${testPath}/${testName}.in`).toString());
                valStream.push(' ');
                valStream.push(stdout);
                valStream.push(null);
                valStream.pipe(validator.stdin);
            }
            else {
                console.error(`\x1b[31mERROR:\x1b[0m There is no '${testName}.in' file and no '${testValName}' validator in '${testPath}' folder.`);
            }
        });
        const streamIn = fs_1.createReadStream(`${testPath}/${testName}.in`);
        streamIn.pipe(child.stdin);
    }
}
exports.Validator = Validator;
