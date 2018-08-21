import { execFile } from 'child_process';
import { createReadStream, readdir, readFileSync, existsSync } from 'fs';
import { ParsedArgs } from 'minimist';

export class Validator {
    programName: string;
    programPath: string;
    sourcePath: string;

    constructor(private args: ParsedArgs) {
        this.programName = args._[1];
        this.sourcePath = this.programName + '.cpp';
        this.programPath = './' + this.programName;
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
            if(!existsSync(this.programName)) {
                console.error("\x1b[31m%s\x1b[0m %s %s", 'ERROR:', "Could not find file: " + this.programName + '.', "Maybe remove 'no-compile' flag?");
                process.exit();
            }
            this.checkFile();
        }
    }

    checkFile() {
        readdir('./tests', (err, items) => {
            if(!items) {
                console.error("\x1b[31m%s\x1b[0m %s", 'ERROR:', "Could not find directory: './tests' or it is empty");
                process.exit();
            }
            items.forEach(item => {
                if(item.endsWith('.in') && item.startsWith(this.programName)) {
                    this.validateProgram(item.replace(/\.[^/.]+$/, ""), 'tests/' + item, 'tests/' + item.replace(/\.[^/.]+$/, "") + '.out');
                }
            });
        });
    }

    validateProgram(testName: string, inputPath: string, outputPath: string) {
        var child = execFile(this.programPath, (error, stdout, stderr) => {
            if (error) {
                console.error("\x1b[31m%s\x1b[0m %s", 'ERROR:', stderr ? stderr : "Could not execute file: " + this.programPath);
                return;
            }
            const out = readFileSync(outputPath);
            if(stdout.trim() == out.toString().trim()) {
                console.log("\x1b[33mTest %s:\x1b[0m \x1b[32m%s\x1b[0m", testName, "SUCCESS");
            } else {
                console.log("\x1b[33mTest %s:\x1b[0m \x1b[31m%s\x1b[0m", testName, "INVALID ANSWER");
                console.log("\x1b[33m### Expected:\x1b[0m\n%s", out.toString().trim());
                console.log('\x1b[33m### Got:     \x1b[0m\n%s', stdout.trim());
            }
        });
        
        const streamIn = createReadStream(inputPath);
        streamIn.pipe(child.stdin);
    }
}
