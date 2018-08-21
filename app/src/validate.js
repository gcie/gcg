"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_1 = require("fs");
class Validator {
    constructor(args) {
        this.args = args;
        this.programName = args._[1];
        this.sourcePath = this.programName + '.cpp';
        this.programPath = './' + this.programName;
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
            if (!fs_1.existsSync(this.programName)) {
                console.error("\x1b[31m%s\x1b[0m %s %s", 'ERROR:', "Could not find file: " + this.programName + '.', "Maybe remove 'no-compile' flag?");
                process.exit();
            }
            this.checkFile();
        }
    }
    checkFile() {
        fs_1.readdir('./tests', (err, items) => {
            if (!items) {
                console.error("\x1b[31m%s\x1b[0m %s", 'ERROR:', "Could not find directory: './tests' or it is empty");
                process.exit();
            }
            items.forEach(item => {
                if (item.endsWith('.in') && item.startsWith(this.programName)) {
                    this.validateProgram(item.replace(/\.[^/.]+$/, ""), 'tests/' + item, 'tests/' + item.replace(/\.[^/.]+$/, "") + '.out');
                }
            });
        });
    }
    validateProgram(testName, inputPath, outputPath) {
        var child = child_process_1.execFile(this.programPath, (error, stdout, stderr) => {
            if (error) {
                console.error("\x1b[31m%s\x1b[0m %s", 'ERROR:', stderr ? stderr : "Could not execute file: " + this.programPath);
                return;
            }
            const out = fs_1.readFileSync(outputPath);
            if (stdout.trim() == out.toString().trim()) {
                console.log("\x1b[33mTest %s:\x1b[0m \x1b[32m%s\x1b[0m", testName, "SUCCESS");
            }
            else {
                console.log("\x1b[33mTest %s:\x1b[0m \x1b[31m%s\x1b[0m", testName, "INVALID ANSWER");
                console.log("\x1b[33m### Expected:\x1b[0m\n%s", out.toString().trim());
                console.log('\x1b[33m### Got:     \x1b[0m\n%s', stdout.trim());
            }
        });
        const streamIn = fs_1.createReadStream(inputPath);
        streamIn.pipe(child.stdin);
    }
}
exports.Validator = Validator;
