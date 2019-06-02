"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const node_html_parser_1 = require("node-html-parser");
const logger_1 = require("./logger");
const Problem_1 = require("./models/Problem");
const Test_1 = require("./models/Test");
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
async function codeforcesInit(contestId, cmd) {
    try {
        const logger = new logger_1.Logger(cmd.log);
        const sampleProgram = fs_1.readFileSync(__dirname + '/../res/templates/main.cpp');
        const contestPageRaw = await getRawPage(`http://codeforces.com/contest/${contestId}`);
        const contestPage = node_html_parser_1.parse(contestPageRaw);
        let problemset = [];
        extractProblemNames(contestId, problemset, contestPage);
        problemset.forEach(problem => {
            const taskname = problem.name.toLowerCase();
            const filename = './' + taskname + '.cpp';
            if (cmd.overwrite || !fs_1.existsSync(filename)) {
                fs_1.writeFileSync(filename, sampleProgram);
                logger.log('Created file:', filename);
            }
            if (!fs_1.existsSync('./tests')) {
                fs_1.mkdirSync('./tests');
                logger.log("Created directory: ./tests");
            }
            if (!fs_1.existsSync('./tests/' + taskname)) {
                fs_1.mkdirSync('./tests/' + taskname);
                logger.log("Created directory: ./tests/" + taskname);
            }
            getRawPage(`http://codeforces.com/contest/${contestId}/problem/${problem.name}`)
                .then(problemPageRaw => {
                extractProblemTests(contestId, problem, problemPageRaw);
                var testc = 1;
                problem.tests.forEach(test => {
                    var inPath = './tests/' + taskname + '/' + taskname + testc + '.in';
                    var outPath = './tests/' + taskname + '/' + taskname + testc + '.out';
                    testc++;
                    if (cmd.overwrite || !fs_1.existsSync(inPath)) {
                        fs_1.writeFileSync(inPath, test.input);
                        logger.log('Created file:', inPath);
                    }
                    if (test.output && (cmd.overwrite || !fs_1.existsSync(outPath))) {
                        fs_1.writeFileSync(outPath, test.output);
                        logger.log('Created file:', outPath);
                    }
                });
            });
        });
    }
    catch (err) {
        console.error(err);
        process.exit();
    }
}
exports.codeforcesInit = codeforcesInit;
function extractProblemTests(contestId, problem, problemPageRaw) {
    problemPageRaw.match(/(?<=Input<\/div><pre>\n)[\s\S]*?(?=<\/pre>)/g)
        .forEach(input => {
        problem.tests.push(new Test_1.Test(input));
    });
    var i = 0;
    problemPageRaw.match(/(?<=Output<\/div><pre>\n)[\s\S]*?(?=<\/pre>)/g)
        .forEach(output => {
        problem.tests[i++].output = output;
    });
    return problem;
}
function extractProblemNames(contestId, problemset, parsedPage) {
    if (parsedPage.tagName == 'a' &&
        parsedPage.rawAttrs.startsWith(`href=\"/contest/${contestId}/problem/`) &&
        parsedPage.parentNode.tagName == 'div') {
        problemset.push(new Problem_1.Problem(/(?<=problem\/)(.*)(?=")/.exec(parsedPage.rawAttrs)[0], parsedPage.childNodes[0].rawText));
    }
    parsedPage.childNodes.forEach(node => extractProblemNames(contestId, problemset, node));
}
function showTagNames(parsedPage) {
    if (parsedPage.tagName == 'a')
        console.log(parsedPage);
    parsedPage.childNodes.forEach(node => {
        showTagNames(node);
    });
}
function getRawPage(url) {
    return new Promise(function (resolve, reject) {
        const request = new XMLHttpRequest();
        request.onload = function () {
            if (this.status === 200) {
                resolve(this.responseText);
            }
            else {
                reject(new Error(`Error! Could not download page \'${url}\'.\nError message: ${this.statusText}`));
            }
        };
        request.onerror = function () {
            reject(new Error(`Error! Could not download page \'${url}\'.\nError message: ${this.statusText}`));
        };
        request.open('GET', url);
        request.send();
    });
}
