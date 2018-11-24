"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const clipboardy_1 = __importDefault(require("clipboardy"));
const fs_1 = require("fs");
const logger_1 = require("./logger");
class Test {
    constructor(input, output) {
        this.input = input;
        this.output = output;
    }
}
class Initializer {
    constructor(commander, taskname) {
        this.commander = commander;
        this.taskname = taskname;
        this.tests = [];
        this.listen = true;
        this.sampleProgram = fs_1.readFileSync(__dirname + '/../res/templates/main.cpp');
        this.logger = new logger_1.Logger(commander.log);
    }
    start() {
        console.log(`Copy tests or type 'q' to quit`);
        clipboardy_1.default.writeSync("");
        this.clipContent = clipboardy_1.default.readSync();
        this.listenClipboard();
        process.stdin.addListener("data", (data) => {
            if (data.toString()[0] == 'q') {
                this.createTask();
                this.tests = [];
                process.exit(0);
            }
            else {
                console.log(`Copy tests or type 'q' to quit.`);
            }
        });
    }
    createTask() {
        const filename = './' + this.taskname + '.cpp';
        if (this.commander.overwrite || !fs_1.existsSync(filename)) {
            fs_1.writeFileSync(filename, this.sampleProgram);
            this.logger.log('Created file:', filename);
        }
        if (!fs_1.existsSync('./tests')) {
            fs_1.mkdirSync('./tests');
            this.logger.log("Created directory: ./tests");
        }
        if (!fs_1.existsSync('./tests/' + this.taskname)) {
            fs_1.mkdirSync('./tests/' + this.taskname);
            this.logger.log("Created directory: ./tests/" + this.taskname);
        }
        var testc = 1;
        this.tests.forEach(test => {
            var inPath = './tests/' + this.taskname + '/' + this.taskname + testc + '.in';
            var outPath = './tests/' + this.taskname + '/' + this.taskname + testc + '.out';
            testc++;
            if (this.commander.overwrite || !fs_1.existsSync(inPath)) {
                fs_1.writeFileSync(inPath, test.input);
                this.logger.log('Created file:', inPath);
            }
            if (test.output && (this.commander.overwrite || !fs_1.existsSync(outPath))) {
                fs_1.writeFileSync(outPath, test.output);
                this.logger.log('Created file:', outPath);
            }
        });
    }
    listenClipboard() {
        let newClip = clipboardy_1.default.readSync();
        if (newClip != this.clipContent) {
            if (this.commander.inputOnly) {
                this.tests.push({ input: newClip, output: undefined });
            }
            else {
                if (this.input) {
                    this.tests.push({ input: this.input, output: newClip });
                    this.input = undefined;
                }
                else {
                    this.input = newClip;
                }
            }
            this.clipContent = newClip;
        }
        if (this.listen) {
            var _this = this;
            setTimeout(function () { _this.listenClipboard(); }, 100);
        }
    }
}
exports.Initializer = Initializer;
