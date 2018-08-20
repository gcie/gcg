import { execFile } from 'child_process';
import { createReadStream, readdir, readFileSync } from 'fs';
import { ParsedArgs } from 'minimist';

export function validate(args: ParsedArgs): void {

}



function validateProgram(programPath: string, inputPath: string, outputPath: string) {
    var child = execFile(programPath, (error, stdout, stderr) => {
        if (error) {
            console.error("\x1b[31m%s\x1b[0m %s", 'ERROR:', stderr ? stderr : "Could not execute file: " + programPath);
            return;
        }
        const out = readFileSync(outputPath);
        if(stdout.trim() == out.toString().trim()) {
            console.log("\x1b[32m%s\x1b[0m", "SUCCESS");
        } else {
            console.log("\x1b[31m%s\x1b[0m", "INVALID ANSWER:");
            console.log(" Expected:", out.toString());
            console.log(' Got:     ', stdout);
        }
    });
    
    const streamIn = createReadStream(inputPath);
    streamIn.pipe(child.stdin);
}

function checkFile(filename: string) {
    readdir('./tests', (err, items) => {
        if(!items) {
            console.error("\x1b[31m%s\x1b[0m %s", 'ERROR:', "Could not find directory: './tests' or it is empty");
            process.exit();
        }
        items.forEach(item => {
            if(item.endsWith('.in') && item.startsWith(filename)) {
                validateProgram(filename, 'tests/' + item, 'tests/' + item.replace(/\.[^/.]+$/, "") + '.out');
            }
        });
    });
}