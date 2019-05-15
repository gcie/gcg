"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const stream_1 = require("stream");
const chalk_1 = __importDefault(require("chalk"));
function run(task, cmd) {
    const sourcePath = task + '.cpp';
    const programPath = './' + task;
    var successes = 0, failures = 0;
    const taskTestsFolderPath = cmd.folder || `tests/${task}`;
    if (!fs_1.existsSync(sourcePath)) {
        console.error(chalk_1.default.red('ERROR:'), "Could not find file: " + sourcePath);
        process.exit();
    }
}
exports.run = run;
class Validator {
    constructor(cmd, programName) {
        this.cmd = cmd;
        this.programName = programName;
        this.sourcePath = this.programName + '.cpp';
        this.programPath = './' + this.programName;
        this.successes = this.failures = 0;
        this.taskTestsFolderPath = cmd.folder || `tests/${this.programName}`;
    }
    start() {
        if (!fs_1.existsSync(this.sourcePath)) {
            console.error(chalk_1.default.red('ERROR:'), "Could not find file: " + this.sourcePath);
            process.exit();
        }
        if (this.cmd.compile) {
            child_process_1.execFile('g++', ['-std=c++17', this.sourcePath, '-o', this.programName], (error, stdout, stderr) => {
                if (error) {
                    console.error(chalk_1.default.red("COMPILE ERROR:"), stderr);
                    process.exit();
                }
                this.checkFile();
            });
        }
        else {
            if (!fs_1.existsSync(this.programName) && !fs_1.existsSync(this.programName + '.exe')) {
                console.error(chalk_1.default.red('ERROR:'), "Could not find file: " + this.programName + '.', "Maybe remove 'no-compile' flag?");
                process.exit();
            }
            this.checkFile();
        }
    }
    checkFile() {
        if (this.cmd.folder) {
            fs_1.readdir(`./${this.cmd.folder}`, (err, items) => {
                if (!items) {
                    console.error(chalk_1.default.red('ERROR:'), `Could not find directory: './${this.cmd.folder}`);
                    process.exit();
                }
                if (this.cmd.test) {
                    if (!fs_1.existsSync(`./${this.cmd.folder}/${this.cmd.test}.in`)) {
                        console.error(chalk_1.default.red('ERROR:'), `Could not find test: "${this.cmd.test}.in".`);
                        process.exit();
                    }
                    this.validateProgram(this.cmd.test, `./${this.cmd.folder}`);
                }
                else {
                    items.forEach(item => {
                        if (item.endsWith('.in')) {
                            this.validateProgram(item.replace(/\.[^/.]+$/, ""), `./${this.cmd.folder}`);
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
                if (this.cmd.test) {
                    if (!fs_1.existsSync(`./tests/${this.cmd.test}.in`))
                        return;
                    this.validateProgram(this.cmd.test, `./tests`);
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
                if (this.cmd.test) {
                    if (!fs_1.existsSync(`./tests/${this.programName}/${this.cmd.test}.in`))
                        return;
                    this.validateProgram(this.cmd.test, `tests/${this.programName}`);
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
                console.error(chalk_1.default.red('RUNTIME ERROR'), '\n', error.message);
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
            const intro = chalk_1.default.gray('------------------------\n') + chalk_1.default.yellow(`Test ${testName}:`);
            if (fs_1.existsSync(testTxtPath)) {
                var destout = fs_1.readFileSync(testTxtPath).toString();
                if (stdout.trim() == destout.trim()) {
                    console.log(intro, chalk_1.default.green('SUCCESS'));
                    this.successes++;
                }
                else {
                    console.log(intro, chalk_1.default.red('INVALID ANSWER'), chalk_1.default.yellow('\nExpected:'), `\n${destout.trim()}`, chalk_1.default.yellow('\nGot:'), `\n${stdout.trim()}`);
                    this.failures++;
                }
            }
            else if (fs_1.existsSync(testValPath + '.exe') || fs_1.existsSync(testValPath)) {
                var validator = child_process_1.execFile(testValPath, (error, stdout, stderr) => {
                    if (error) {
                        console.error(intro, chalk_1.default.red('ERROR:'), stderr ? stderr : `Could not execute file: ${testValPath}`);
                        this.failures++;
                    }
                    else if (stdout.trim() == '') {
                        console.log(intro, chalk_1.default.green('SUCCESS'));
                        this.successes++;
                    }
                    else {
                        console.log(intro, chalk_1.default.red('INVALID ANSWER'), chalk_1.default.yellow('\nChecker result:'), `\n${stdout.trim()}`);
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
                console.log(intro, chalk_1.default.blue('NO CHECKER'), chalk_1.default.yellow(`\nAnswer:`), `\n${stdout.trim()}`);
            }
        });
        const streamIn = fs_1.createReadStream(`${testPath}/${testName}.in`);
        streamIn.pipe(child.stdin);
    }
}
exports.Validator = Validator;
