import clip from "clipboardy";
import { CommanderStatic } from "commander";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { Logger } from "./logger";

class Test {
    constructor(public input: string, public output?: string) { }
}

export class Initializer {
    private logger: Logger;
    private tests: Array<Test> = [];
    private input?: string;
    private clipContent?: string;
    private listen: boolean = true;
    private sampleProgram = readFileSync(__dirname + '/../res/templates/main.cpp');

    constructor(private commander: CommanderStatic, private taskname: string) {
        this.logger = new Logger(commander.log);
    }

    start(): void {
        // if(this.args._[1]) { // Single task mode
            console.log(`Copy tests or type 'q' to quit`);
            
            clip.writeSync(""); // reset clipboard
            this.clipContent = clip.readSync();
            this.listenClipboard();

            process.stdin.addListener("data", (data: Buffer) => {
                if (data.toString()[0] == 'q') {
                    this.createTask();
                    this.tests = [];
                    process.exit(0);
                } else {
                    console.log(`Copy tests or type 'q' to quit.`);
                }
            });
/*      } else { // Multiple tasks mode
            console.log(`Copy tests or type 's' to skip to next task. Type 'q' to quit.`);
            var taskc = 0;
    
            clip.writeSync(""); // reset clipboard
            this.clipContent = clip.readSync();
            this.listenClipboard();
    
            process.stdin.addListener("data", (data: Buffer) => {
                if(data.toString()[0] == 's') {
                    this.createTask(String.fromCharCode(97 + taskc++));
                    this.tests = [];
                    this.logger.log("Skipping to next task");
                } else if (data.toString()[0] == 'q') {
                    this.createTask(String.fromCharCode(97 + taskc++));
                    this.tests = [];
                    process.exit(0);
                } else {
                    console.log(`Copy tests or type 's' to skip to next task. Type 'q' to quit.`);
                }
            });
        } */
    }

    createTask() {
        const filename = './' + this.taskname + '.cpp';
        if(this.commander.overwrite || !existsSync(filename)) {
            writeFileSync(filename, this.sampleProgram);
            this.logger.log('Created file:', filename);
        }
        if(!existsSync('./tests')) {
            mkdirSync('./tests');
            this.logger.log("Created directory: ./tests");
        }
        if(!existsSync('./tests/' + this.taskname)) {
            mkdirSync('./tests/' + this.taskname);
            this.logger.log("Created directory: ./tests/" + this.taskname);
        }
        var testc = 1;
        this.tests.forEach(test => {
            var inPath = './tests/' + this.taskname + '/' + this.taskname + testc + '.in';
            var outPath = './tests/' + this.taskname + '/' + this.taskname + testc + '.out';
            testc++;

            if(this.commander.overwrite || !existsSync(inPath)) {
                writeFileSync(inPath, test.input);
                this.logger.log('Created file:', inPath)
            }

            if(test.output && (this.commander.overwrite || !existsSync(outPath))) {
                writeFileSync(outPath, test.output);
                this.logger.log('Created file:', outPath)
            }
        });
    }


    listenClipboard() {
        let newClip: string | undefined = clip.readSync();
        if (newClip != this.clipContent) {
            if(this.commander.inputOnly) {
                this.tests.push({input: newClip, output: undefined});
            } else {
                if(this.input) {
                    this.tests.push({input: this.input, output: newClip});
                    this.input = undefined;
                } else {
                    this.input = newClip;
                }
            }
            this.clipContent = newClip;
        }
        if(this.listen) {
            var _this = this;
            setTimeout(function(){_this.listenClipboard()}, 100);
        }
    }

}