"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const sampleProgram = fs_1.readFileSync(__dirname + '../res/template.cpp');
function generateDirectory(tasks, tests, overwrite = false) {
    if (!fs_1.existsSync('tests')) {
        fs_1.mkdirSync('tests');
        console.log("Created directory: tests");
    }
    var a = 'a';
    for (let i = 0; i < +tasks; i++) {
        if (overwrite || !fs_1.existsSync(a + '.cpp')) {
            fs_1.writeFileSync(a + '.cpp', sampleProgram);
            console.log('Created file:', a + '.cpp');
        }
        for (let j = 1; j <= tests; j++) {
            if (overwrite || !fs_1.existsSync('tests/' + a + j + '.in')) {
                fs_1.writeFileSync('tests/' + a + j + '.in', '');
                console.log('Created file:', 'tests/' + a + j + '.in');
            }
            if (overwrite || !fs_1.existsSync('tests/' + a + j + '.out')) {
                fs_1.writeFileSync('tests/' + a + j + '.out', '');
                console.log('Created file:', 'tests/' + a + j + '.out');
            }
        }
        a = String.fromCharCode(a.charCodeAt(0) + 1);
    }
}
function init(args) {
    const tasks = args.tasks;
    const tests = args.tests;
    if (tasks < 0 || tests < 0) {
        console.error('Please specify valid number of tasks and tests!');
    }
    else {
        generateDirectory(tasks, tests, args.overwrite);
    }
}
exports.init = init;
