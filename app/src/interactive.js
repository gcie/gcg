"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const clipboardy_1 = __importDefault(require("clipboardy"));
const logger_1 = require("./logger");
const fs_1 = require("fs");
class Test {
    constructor(input, output) {
        this.input = input;
        this.output = output;
    }
}
class Interactive {
    constructor(args) {
        this.args = args;
        this.tests = [];
        this.listen = true;
        this.sampleProgram = fs_1.readFileSync(__dirname + '/../res/templates/main.cpp');
        this.logger = new logger_1.Logger(args);
    }
    start() {
        if (this.args._[1]) { // Single task mode
            console.log(`Copy tests or type 'q' to quit`);
            clipboardy_1.default.writeSync(""); // reset clipboard
            this.clipContent = clipboardy_1.default.readSync();
            this.listenClipboard();
            process.stdin.addListener("data", (data) => {
                if (data.toString()[0] == 'q') {
                    this.createTask(this.args._[1]);
                    this.tests = [];
                    process.exit(0);
                }
                else {
                    console.log(`Copy tests or type 'q' to quit.`);
                }
            });
        }
        else { // Multiple tasks mode
            console.log(`Copy tests or type 's' to skip to next task. Type 'q' to quit.`);
            var taskc = 0;
            clipboardy_1.default.writeSync(""); // reset clipboard
            this.clipContent = clipboardy_1.default.readSync();
            this.listenClipboard();
            process.stdin.addListener("data", (data) => {
                if (data.toString()[0] == 's') {
                    this.createTask(String.fromCharCode(97 + taskc++));
                    this.tests = [];
                    this.logger.log("Skipping to next task");
                }
                else if (data.toString()[0] == 'q') {
                    this.createTask(String.fromCharCode(97 + taskc++));
                    this.tests = [];
                    process.exit(0);
                }
                else {
                    console.log(`Copy tests or type 's' to skip to next task. Type 'q' to quit.`);
                }
            });
        }
    }
    createTask(name) {
        const filename = './' + name + '.cpp';
        if (this.args.overwrite || !fs_1.existsSync(filename)) {
            fs_1.writeFileSync(filename, this.sampleProgram);
            this.logger.log('Created file:', filename);
        }
        if (!fs_1.existsSync('./tests')) {
            fs_1.mkdirSync('./tests');
            this.logger.log("Created directory: ./tests");
        }
        var testc = 1;
        this.tests.forEach(test => {
            var inPath = './tests/' + name + testc + '.in';
            var outPath = './tests/' + name + testc + '.out';
            testc++;
            if (this.args.overwrite || !fs_1.existsSync(inPath)) {
                fs_1.writeFileSync(inPath, test.input);
                this.logger.log('Created file:', inPath);
            }
            if (this.args.overwrite || !fs_1.existsSync(outPath)) {
                fs_1.writeFileSync(outPath, test.output);
                this.logger.log('Created file:', outPath);
            }
        });
    }
    listenClipboard() {
        let newClip = clipboardy_1.default.readSync();
        if (newClip != this.clipContent) {
            if (this.input) {
                this.tests.push({ input: this.input, output: newClip });
                this.input = undefined;
            }
            else {
                this.input = newClip;
            }
            this.clipContent = newClip;
        }
        if (this.listen) {
            var _this = this;
            setTimeout(function () { _this.listenClipboard(); }, 100);
        }
    }
}
exports.Interactive = Interactive;
