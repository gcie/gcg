import { execFile } from 'child_process';
import { createReadStream, readdir, readFileSync, existsSync, exists } from 'fs';
import { ParsedArgs } from 'minimist';
import { Readable } from 'stream';

export class Validator {
    programName: string;
    programPath: string;
    sourcePath: string;
    taskTestsFolderPath: string;
    successes: number;
    failures: number;

    constructor(private args: ParsedArgs) {
        this.programName = args._[1];
        this.sourcePath = this.programName + '.cpp';
        this.programPath = './' + this.programName;
        this.successes = this.failures = 0;
        this.taskTestsFolderPath = args.f || `tests/${this.programName}`;

    }

    start() {
        if(!existsSync(this.sourcePath)) {
            console.error("\x1b[31m%s\x1b[0m%s", 'ERROR:', "Could not find file: " + this.sourcePath);
            process.exit();
        }
        if(this.args.compile) {
            execFile('g++', 
                ['-std=c++17', this.sourcePath,  '-o', this.programName], (error: Error | null, stdout: string, stderr: string) => {
                    if(error) {
                        console.error("\x1b[31m%s\x1b[0m %s", "COMPILE ERROR:", stderr);
                        process.exit();
                    }
                    this.checkFile();
                });
        } else {
            if(!existsSync(this.programName) && !existsSync(this.programName + '.exe')) { // FIXME: Check OS and resolve correct file
                console.error("\x1b[31m%s\x1b[0m %s %s", 'ERROR:', "Could not find file: " + this.programName + '.', "Maybe remove 'no-compile' flag?");
                process.exit();
            }
            this.checkFile();
        }
    }

    checkFile() {
        if(this.args.f) {
            readdir(`./${this.args.f}`, (err, items) => {
                if(!items) {
                    console.error(`\x1b[31mERROR: \x1b[0mCould not find directory: './${this.args.f}`);
                    process.exit();
                }
                if(this.args.t) {
                    if(!existsSync(`./${this.args.f}/${this.args.t}.in`)) {
                        console.error("\x1b[31m%s\x1b[0m %s %s", 'ERROR:', `Could not find test: "${this.args.t}.in".`);
                        process.exit();
                    }
                    this.validateProgram(this.args.t, `./${this.args.f}`);
                } else {
                    items.forEach(item => {
                        if(item.endsWith('.in')) {
                            this.validateProgram(item.replace(/\.[^/.]+$/, ""), `./${this.args.f}`);
                        }
                    });
                }
            });
        } else {
            readdir(`./tests`, (err, items) => {
                if(err || !items || items.length == 0) {
                    return;
                }
                if(this.args.t) {
                    if(!existsSync(`./tests/${this.args.t}.in`)) return;
                    this.validateProgram(this.args.t, `./tests`);
                } else {
                    items.forEach(item => {
                        if(item.endsWith('.in') && item.startsWith(this.programName)) {
                            this.validateProgram(item.replace(/\.[^/.]+$/, ""), `./tests`);
                        }
                    });
                }
            });
            readdir(`./tests/${this.programName}`, (err, items) => {
                if(err || !items || items.length == 0) {
                    return;
                }
                if(this.args.t) {
                    if(!existsSync(`./tests/${this.programName}/${this.args.t}.in`)) return;
                    this.validateProgram(this.args.t, `tests/${this.programName}/${this.args.t}`);
                } else {
                    items.forEach(item => {
                        if(item.endsWith('.in')) {
                            this.validateProgram(item.replace(/\.[^/.]+$/, ""), `./tests/${this.programName}`);
                        }
                    });
                }
            });
        }
        
    }

    validateProgram(testName: string, testPath: string) {
        var child = execFile(this.programPath, (error, stdout, stderr) => {
            if (error) {
                console.error("\x1b[31m%s\x1b[0m %s\n", 'ERROR:', stderr ? stderr : `Could not execute file: ${this.programPath}`, error.message);
                return;
            }
        
            var testOutExt: string;
            if(existsSync(`${testPath}/${testName}.out`)) {
                testOutExt = '.out';
            } else {
                testOutExt = '.ans';
            }
            const testTxtPath = `${testPath}/${testName}${testOutExt}`;
            const testValName = this.programName + '_out';
            const testValPath = `${testPath}/${testValName}`;

            if(existsSync(testTxtPath)) {
                var destout = readFileSync(testTxtPath).toString();
                if(stdout.trim() == destout.trim()) {
                    console.log(`\x1b[33mTest ${testName}:\x1b[0m \x1b[32mSUCCESS\x1b[0m`);
                    this.successes++;
                } else {
                    console.log(`\x1b[33mTest ${testName}:\x1b[0m \x1b[31mINVALID ANSWER\x1b[0m\n\x1b[33m### Expected:\x1b[0m\n${destout.trim()}\n\x1b[33m### Got:     \x1b[0m\n${stdout.trim()}`);
                    this.failures++;
                }
            } else if(true /* existsSync(testValPath + '.exe') */) {
                var validator = execFile(testValPath, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`\x1b[33mTest ${testName}:\x1b[0m \x1b[31mERROR:\x1b[0m %s`, stderr ? stderr : `Could not execute file: ${testValPath}`);
                        this.failures++;
                    } else if(stdout.trim() == '') {
                        console.log(`\x1b[33mTest ${testName}:\x1b[0m \x1b[32mSUCCESS\x1b[0m`);
                        this.successes++;
                    } else {
                        console.log(`\x1b[33mTest ${testName}:\x1b[0m \x1b[31mINVALID ANSWER\x1b[0m\n\x1b[33m### Checker result: \x1b[0m${stdout.trim()}`);
                        this.failures++;
                    }
                });
                const valStream = new Readable();
                valStream._read = () => {};
                valStream.push(readFileSync(`${testPath}/${testName}.in`).toString());
                valStream.push(' ');
                valStream.push(stdout);
                valStream.push(null);
                valStream.pipe(validator.stdin);
            } else {
                console.error(`\x1b[31mERROR:\x1b[0m There is no '${testName}.in' file and no '${testValName}' validator in '${testPath}' folder.`);
            }
        });
        
        const streamIn = createReadStream(`${testPath}/${testName}.in`);
        streamIn.pipe(child.stdin);
    }
}
