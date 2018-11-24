import { CommanderStatic } from 'commander';
import { execFile } from 'child_process';
import { createReadStream, readdir, readFileSync, existsSync, exists } from 'fs';
import { Readable } from 'stream';
import chalk from 'chalk';

export class Validator {
    programPath: string;
    sourcePath: string;
    taskTestsFolderPath: string;
    successes: number;
    failures: number;

    constructor(private cmd: CommanderStatic, private programName: string) {
        this.sourcePath = this.programName + '.cpp';
        this.programPath = './' + this.programName;
        this.successes = this.failures = 0;
        this.taskTestsFolderPath = cmd.folder || `tests/${this.programName}`;
    }

    start() {
        if(!existsSync(this.sourcePath)) {
            console.error(chalk.red('ERROR:'), "Could not find file: " + this.sourcePath);
            process.exit();
        }
        if(this.cmd.compile) {
            execFile('g++', 
                ['-std=c++17', this.sourcePath,  '-o', this.programName], (error: Error | null, stdout: string, stderr: string) => {
                    if(error) {
                        console.error(chalk.red("COMPILE ERROR:"), stderr);
                        process.exit();
                    }
                    this.checkFile();
                });
        } else {
            if(!existsSync(this.programName) && !existsSync(this.programName + '.exe')) { // FIXME: Check OS and resolve correct file
                console.error(chalk.red('ERROR:'), "Could not find file: " + this.programName + '.', "Maybe remove 'no-compile' flag?");
                process.exit();
            }
            this.checkFile();
        }
    }

    checkFile() {
        if(this.cmd.folder) {
            readdir(`./${this.cmd.folder}`, (err, items) => {
                if(!items) {
                    console.error(chalk.red('ERROR:'), `Could not find directory: './${this.cmd.folder}`);
                    process.exit();
                }
                if(this.cmd.test) {
                    if(!existsSync(`./${this.cmd.folder}/${this.cmd.test}.in`)) {
                        console.error(chalk.red('ERROR:'), `Could not find test: "${this.cmd.test}.in".`);
                        process.exit();
                    }
                    this.validateProgram(this.cmd.test, `./${this.cmd.folder}`);
                } else {
                    items.forEach(item => {
                        if(item.endsWith('.in')) {
                            this.validateProgram(item.replace(/\.[^/.]+$/, ""), `./${this.cmd.folder}`);
                        }
                    });
                }
            });
        } else {
            readdir(`./tests`, (err, items) => {
                if(err || !items || items.length == 0) {
                    return;
                }
                if(this.cmd.test) {
                    if(!existsSync(`./tests/${this.cmd.test}.in`)) return;
                    this.validateProgram(this.cmd.test, `./tests`);
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
                if(this.cmd.test) {
                    if(!existsSync(`./tests/${this.programName}/${this.cmd.test}.in`)) return;
                    this.validateProgram(this.cmd.test, `tests/${this.programName}`);
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
                console.error(chalk.red('RUNTIME ERROR'), '\n', error.message);
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
                    console.log(chalk.yellow(`Test ${testName}:`), chalk.green('SUCCESS'));
                    this.successes++;
                } else {
                    console.log(chalk.yellow(`Test ${testName}:`), chalk.red('INVALID ANSWER'), chalk.yellow('\n### Expected:'), `\n${destout.trim()}`, chalk.yellow('\n### Got:'), `\n${stdout.trim()}`);
                    this.failures++;
                }
            } else if(existsSync(testValPath + '.exe')) {
                var validator = execFile(testValPath, (error, stdout, stderr) => {
                    if (error) {
                        console.error(chalk.yellow(`Test ${testName}:`), chalk.red('ERROR:'), stderr ? stderr : `Could not execute file: ${testValPath}`);
                        this.failures++;
                    } else if(stdout.trim() == '') {
                        console.log(chalk.yellow(`Test ${testName}:`), chalk.green('SUCCESS'));
                        this.successes++;
                    } else {
                        console.log(chalk.yellow(`Test ${testName}:`), chalk.red('INVALID ANSWER'), chalk.yellow('\n### Checker result:'), `\n${stdout.trim()}`);
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
                console.log(chalk.yellow(`Test ${testName}:`), chalk.blue('NO CHECKER'), chalk.yellow(`\n### Answer:`),  `\n${stdout.trim()}`);
                // console.error(`\x1b[31mERROR:\x1b[0m There is no '${testName}.out' or '${testName}.ans' file and no '${testValName}' validator in '${testPath}' folder.`);
            }
        });
        
        const streamIn = createReadStream(`${testPath}/${testName}.in`);
        streamIn.pipe(child.stdin);
    }
}
