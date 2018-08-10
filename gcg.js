#!/usr/bin/env node

const execFile = require('child_process').execFile;
const fs = require('fs');
var argv = require('./minimist')(process.argv.slice(2));

var sampleProgram = 
`#include <bits/stdc++.h>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(0);
    
    
    
    return 0;
}
`;

function validateProgram(programPath, inputPath, outputPath) {
    var child = execFile(programPath, (error, stdout, stderr) => {
        if (error) {
            console.error("\x1b[31m%s\x1b[0m%s", 'ERROR:', stderr);
            return;
        }
        const out = fs.readFileSync(outputPath);
        if(stdout.trim() == out.toString().trim()) {
            console.log("\x1b[32m%s\x1b[0m", "SUCCESS");
        } else {
            console.log("\x1b[31m%s\x1b[0m", "INVALID ANSWER:");
            console.log(" Expected:", out.toString());
            console.log(' Got:     ', stdout);
        }
    });
    
    const streamIn = fs.createReadStream(inputPath);
    streamIn.pipe(child.stdin);
}

function checkFile(filename) {
    fs.readdir(__dirname + '/' + filename, (err, items) => {
        items.forEach(item => {
            if(item.endsWith('.in')) {
                validateProgram(filename, filename + '/' + item, filename + '/' + item.replace(/\.[^/.]+$/, "") + '.out');
            }
        })
    })
}

function generateDirectory(tasks, tests) {
    var a = 'a';
    for (let i = 0; i < +tasks; i++) {
        if(!fs.existsSync(a)) {
            fs.mkdirSync(a);
            console.log("Created directory:", a);
        }
        if(!fs.existsSync(a + '.cpp')) {
            fs.writeFileSync(a + '.cpp', sampleProgram);
            console.log('Created file:', a + '.cpp');
        }
        for(let j = 1; j <= tests; j++) {
            if(!fs.existsSync(a + '/' + a + j + '.in')) {
                fs.writeFileSync(a + '/' + a + j + '.in', '');
                console.log('Created file:', a + '/' + a + j + '.in');
            }
            if(!fs.existsSync(a + '/' + a + j + '.out')) {
                fs.writeFileSync(a + '/' + a + j + '.out', '');
                console.log('Created file:', a + '/' + a + j + '.out');
            }
        }
        a = String.fromCharCode(a.charCodeAt(0) + 1);
    }
}

if(argv._[0]) { // Execute mode
    if(argv.compile) {
        execFile('g++', 
            ['-std=c++17', argv._[0] + '.cpp',  '-o', argv._[0]], 
            (error, stdout, stderr) => {
                if(error) {
                    console.log("\x1b[31m%s\x1b[0m", "COMPILE ERROR:");
                    console.log(stderr);
                    throw error;
                }
                checkFile(argv._[0]);
        });
    } else {
        checkFile(argv._[0]);
    }
    
} else { // Interactive mode
    process.stdout.write('Amount of tasks: ');
    var stdin = process.openStdin();

    stdin.addListener("data", function(tasks) {
        process.stdout.write("Amount of tests: ");
        stdin.addListener("data", function(tests) {
            generateDirectory(tasks, tests);
            process.exit();
        });
    });
}