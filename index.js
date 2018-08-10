#!/usr/bin/env node

const execFile = require('child_process').execFile;
const fs = require('fs');
var argv = require('./minimist')(process.argv.slice(2), { default: { compile: true }});


var sampleProgram = fs.readFileSync(__dirname + '/template.cpp');

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

function generateDirectory(tasks, tests) {
    if(!fs.existsSync('tests')) {
        fs.mkdirSync('tests');
        console.log("Created directory: tests");
    }
    var a = 'a';
    for (let i = 0; i < +tasks; i++) {
        if(!fs.existsSync(a + '.cpp')) {
            fs.writeFileSync(a + '.cpp', sampleProgram);
            console.log('Created file:', a + '.cpp');
        }
        for(let j = 1; j <= tests; j++) {
            if(!fs.existsSync('tests/' + a + j + '.in')) {
                fs.writeFileSync('tests/' + a + j + '.in', '');
                console.log('Created file:', 'tests/' + a + j + '.in');
            }
            if(!fs.existsSync('tests/' + a + j + '.out')) {
                fs.writeFileSync('tests/' + a + j + '.out', '');
                console.log('Created file:', 'tests/' + a + j + '.out');
            }
        }
        a = String.fromCharCode(a.charCodeAt(0) + 1);
    }
}


if(argv.init) { // Interactive mode
    process.stdout.write('Amount of tasks: ');
    var stdin = process.openStdin();
    
    var tasks, tests;
    stdin.addListener("data", function(data) {
        if(!tasks && +data > 0) {
            tasks = data;
            process.stdout.write("Amount of tests: ");
        } else if(!tests && +data > 0) {
            tests = data;
            if(tasks && tests) {
                generateDirectory(tasks, tests);
                process.exit();
            }
        } else if(tasks && tests) {
            generateDirectory(tasks, tests);
            process.exit();            
        } else {
            console.log("Invalid input!");
        }
    });
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