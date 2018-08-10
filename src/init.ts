import minimist from 'minimist';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';

const sampleProgram = readFileSync(__dirname + '../res/template.cpp');

function generateDirectory(tasks: number, tests: number, overwrite: boolean = false): void {
    if(!existsSync('tests')) {
        mkdirSync('tests');
        console.log("Created directory: tests");
    }
    var a = 'a';
    for (let i = 0; i < +tasks; i++) {
        if(overwrite || !existsSync(a + '.cpp')) {
            writeFileSync(a + '.cpp', sampleProgram);
            console.log('Created file:', a + '.cpp');
        }
        for(let j = 1; j <= tests; j++) {
            if(overwrite || !existsSync('tests/' + a + j + '.in')) {
                writeFileSync('tests/' + a + j + '.in', '');
                console.log('Created file:', 'tests/' + a + j + '.in');
            }
            if(overwrite || !existsSync('tests/' + a + j + '.out')) {
                writeFileSync('tests/' + a + j + '.out', '');
                console.log('Created file:', 'tests/' + a + j + '.out');
            }
        }
        a = String.fromCharCode(a.charCodeAt(0) + 1);
    }
}

export function init(args: minimist.ParsedArgs) {
    const tasks: number = args.tasks;
    const tests: number = args.tests;
    if(tasks < 0 || tests < 0) {
        console.error('Please specify valid number of tasks and tests!');
    } else {
        generateDirectory(tasks, tests, args.overwrite);
    }
}