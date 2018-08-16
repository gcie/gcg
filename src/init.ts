import minimist from 'minimist';
import { readFileSync, exists, mkdir, writeFile, existsSync } from 'fs';
import { Logger } from './logger';

export class Initializer {
    private logger: Logger;
    private tasks: number;
    private tests: number;
    private overwrite: boolean;
    private sampleProgram = readFileSync(__dirname + '/../res/template.cpp');

    constructor(private args: minimist.ParsedArgs) { 
        this.logger = new Logger(args);
        this.tasks = +args.tasks;
        this.tests = +args.tests;
        this.overwrite = args.overwrite;
    }

    init(): void {
        if(this.tasks < 0 || this.tests < 0) {
            this.logger.error('Please specify valid number of tasks and tests!');
        } else {
            this.generateDirectory();
        }
    }

    generateTests(): void {
        for (let t = 0; t < this.tasks; t++) {
            for (let i = 0; i < this.tests; i++) {
                var inPath = './tests/' + String.fromCharCode(97 + t) + i + '.in';
                var outPath = './tests/' + String.fromCharCode(97 + t) + i + '.out';

                if(this.overwrite || !existsSync(inPath)) {
                    writeFile(inPath, '', this.logger.callback('Created file: ' + inPath));
                }

                if(this.overwrite || !existsSync(outPath)) {
                    writeFile(outPath, '', this.logger.callback('Created file: ' + outPath));
                }
            }
        }
    }

    generateDirectory(): void {

        exists('./tests', (exists) => {
            if(!exists) {
                mkdir('./tests', (err) => {
                    if(err) {
                        this.logger.error(err.message);
                    } else {
                        this.logger.log("Created directory: ./tests");
                        this.generateTests();
                    }
                });
            } else {
                this.generateTests();
            }
        });

        for (let i = 0; i < this.tasks; i++) {
            var a = './' + String.fromCharCode(97 + i) + '.cpp';
            if(this.overwrite || !existsSync(a)) {
                writeFile(a, this.sampleProgram, this.logger.callback('Created file: ' + a));
            }
        }
    }
}   
