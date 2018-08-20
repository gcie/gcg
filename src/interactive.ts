import { ParsedArgs } from "minimist";
import clip from "clipboardy";
import { Logger } from "./logger";
import { existsSync, readFileSync, writeFile, writeFileSync, mkdirSync } from "fs";

class Test {
    constructor(public input: string, public output: string) { }
}

export class Interactive {
    private logger: Logger;
    private tests: Array<Test> = [];
    private input?: string;
    private clipContent?: string;
    private listen: boolean = true;
    private sampleProgram = readFileSync(__dirname + '/../res/template.cpp');

    constructor(private args: ParsedArgs) {
        this.logger = new Logger(args);
    }

    start(): void {
        console.log(`Created first task. Copy tests or press 's' to skip to next task. Press 'q' to quit.`);
        var taskc = 0;

        clip.writeSync(""); // reset clipboard
        this.clipContent = clip.readSync();
        this.listenClipboard();

        process.stdin.addListener("data", (data: Buffer) => {
            if(data.toString()[0] == 's') {
                this.createTask(taskc++);
                this.tests = [];
                this.logger.log("Skipping to next task");
            } else if (data.toString()[0] == 'q') {
                this.createTask(taskc++);
                this.tests = [];
                process.exit(0);
            } else {
                console.log(`Copy tests or press 's' to skip to next task. Press 'q' to quit.`);
            }
        });
    }

    createTask(i: number) {
        const filename = './' + String.fromCharCode(i + 97) + '.cpp';
        if(this.args.overwrite || !existsSync(filename)) {
            writeFileSync(filename, this.sampleProgram);
            this.logger.log('Created file:', filename);
        }
        if(!existsSync('./tests')) {
            mkdirSync('./tests');
            this.logger.log("Created directory: ./tests");
        }
        var testc = 1;
        this.tests.forEach(test => {
            var inPath = './tests/' + String.fromCharCode(i + 97) + testc + '.in';
            var outPath = './tests/' + String.fromCharCode(i + 97) + testc + '.out';
            testc++;

            if(this.args.overwrite || !existsSync(inPath)) {
                writeFileSync(inPath, test.input);
                this.logger.log('Created file:', inPath)
            }

            if(this.args.overwrite || !existsSync(outPath)) {
                writeFileSync(outPath, test.output);
                this.logger.log('Created file:', outPath)
            }
        });
    }


    listenClipboard() {
        let newClip: string | undefined = clip.readSync();
        if (newClip != this.clipContent) {
            if(this.input) {
                this.tests.push({input: this.input, output: newClip});
                this.input = undefined;
            } else {
                this.input = newClip;
            }
            this.clipContent = newClip;
        }
        if(this.listen) {
            var _this = this;
            setTimeout(function(){_this.listenClipboard()}, 100);
        }
    }

}