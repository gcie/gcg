"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_1 = require("fs");
function validate(args) {
}
exports.validate = validate;
function validateProgram(programPath, inputPath, outputPath) {
    var child = child_process_1.execFile(programPath, (error, stdout, stderr) => {
        if (error) {
            console.error("\x1b[31m%s\x1b[0m %s", 'ERROR:', stderr ? stderr : "Could not execute file: " + programPath);
            return;
        }
        const out = fs_1.readFileSync(outputPath);
        if (stdout.trim() == out.toString().trim()) {
            console.log("\x1b[32m%s\x1b[0m", "SUCCESS");
        }
        else {
            console.log("\x1b[31m%s\x1b[0m", "INVALID ANSWER:");
            console.log(" Expected:", out.toString());
            console.log(' Got:     ', stdout);
        }
    });
    const streamIn = fs_1.createReadStream(inputPath);
    streamIn.pipe(child.stdin);
}
function checkFile(filename) {
    fs_1.readdir('./tests', (err, items) => {
        if (!items) {
            console.error("\x1b[31m%s\x1b[0m %s", 'ERROR:', "Could not find directory: './tests' or it is empty");
            process.exit();
        }
        items.forEach(item => {
            if (item.endsWith('.in') && item.startsWith(filename)) {
                validateProgram(filename, 'tests/' + item, 'tests/' + item.replace(/\.[^/.]+$/, "") + '.out');
            }
        });
    });
}
