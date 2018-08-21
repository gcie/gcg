"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const logger_1 = require("./logger");
class Initializer {
    constructor(args) {
        this.args = args;
        this.sampleProgram = fs_1.readFileSync(__dirname + '/../res/templates/main.cpp');
        this.logger = new logger_1.Logger(args);
        this.tasks = +args.tasks;
        this.tests = +args.tests;
        this.overwrite = args.overwrite;
    }
    start() {
        if (this.tasks < 0 || this.tests < 0) {
            this.logger.error('Please specify valid number of tasks and tests!');
        }
        else {
            this.generateDirectory();
        }
    }
    generateTests() {
        for (let t = 0; t < this.tasks; t++) {
            for (let i = 0; i < this.tests; i++) {
                var inPath = './tests/' + String.fromCharCode(97 + t) + i + '.in';
                var outPath = './tests/' + String.fromCharCode(97 + t) + i + '.out';
                if (this.overwrite || !fs_1.existsSync(inPath)) {
                    fs_1.writeFile(inPath, '', this.logger.callback('Created file: ' + inPath));
                }
                if (this.overwrite || !fs_1.existsSync(outPath)) {
                    fs_1.writeFile(outPath, '', this.logger.callback('Created file: ' + outPath));
                }
            }
        }
    }
    generateDirectory() {
        fs_1.exists('./tests', (exists) => {
            if (!exists) {
                fs_1.mkdir('./tests', (err) => {
                    if (err) {
                        this.logger.error(err.message);
                    }
                    else {
                        this.logger.log("Created directory: ./tests");
                        this.generateTests();
                    }
                });
            }
            else {
                this.generateTests();
            }
        });
        for (let i = 0; i < this.tasks; i++) {
            var a = './' + String.fromCharCode(97 + i) + '.cpp';
            if (this.overwrite || !fs_1.existsSync(a)) {
                fs_1.writeFile(a, this.sampleProgram, this.logger.callback('Created file: ' + a));
            }
        }
    }
}
exports.Initializer = Initializer;
