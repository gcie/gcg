#!/usr/bin/env node

const execFile = require('child_process').execFile;
const fs = require('fs');
var argv = require('./minimist')(process.argv.slice(2), { default: { compile: true }});



function validateProgram(programPath, inputPath, outputPath) {
    var child = execFile(programPath, (error, stdout, stderr) => {
        if (error) {
            console.error("\x1b[31m%s\x1b[0m %s", 'ERROR:', stderr ? stderr : "Could not execute file: " + programPath);
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
    fs.readdir('./tests', (err, items) => {
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



if(argv._[0] === 'init' || argv.init) { // Interactive mode
    require('./src/init')();
} else if(argv._[0]) { // Execute mode
    if(argv.compile) {
        if(!fs.existsSync(argv._[0] + '.cpp')) {
            console.error("\x1b[31m%s\x1b[0m%s", 'ERROR:', "Could not find file: " + argv._[0] + '.cpp');
            process.exit();
        }
        execFile('g++', 
            ['-std=c++17', argv._[0] + '.cpp',  '-o', argv._[0]], 
            (error, stdout, stderr) => {
                if(error) {
                    console.error("\x1b[31m%s\x1b[0m %s", "COMPILE ERROR:", stderr);
                    process.exit();
                }
                checkFile(argv._[0]);
        });
    } else {
        checkFile(argv._[0]);
    }
} else { // Display help
    
}