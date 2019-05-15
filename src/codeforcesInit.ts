import { CommanderStatic } from 'commander';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { parse } from 'node-html-parser';
import { Logger } from './logger';
import { Problem } from './models/Problem';
import { Test } from './models/Test';

const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;


export async function codeforcesInit(contestId: string, cmd: CommanderStatic) {
    try {
        const logger = new Logger(cmd.log);
        const sampleProgram = readFileSync(__dirname + '/../res/templates/main.cpp');
        const contestPageRaw = await getRawPage(`http://codeforces.com/contest/${contestId}`);
        const contestPage = parse(contestPageRaw);
        let problemset: Array<Problem> = [];
        extractProblemNames(contestId, problemset, contestPage);
        problemset.forEach(problem => {
            
            const taskname = problem.name.toLowerCase();
            const filename = './' + taskname + '.cpp';
            if(cmd.overwrite || !existsSync(filename)) {
                writeFileSync(filename, sampleProgram);
                logger.log('Created file:', filename);
            }
            if(!existsSync('./tests')) {
                mkdirSync('./tests');
                logger.log("Created directory: ./tests");
            }
            if(!existsSync('./tests/' + taskname)) {
                mkdirSync('./tests/' + taskname);
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

                        if(cmd.overwrite || !existsSync(inPath)) {
                            writeFileSync(inPath, test.input);
                            logger.log('Created file:', inPath)
                        }

                        if(test.output && (cmd.overwrite || !existsSync(outPath))) {
                            writeFileSync(outPath, test.output);
                            logger.log('Created file:', outPath)
                        }
                    });
                });
            
        });
    } catch(err) {
        console.error(err);
        process.exit();
    }
}

function extractProblemTests(contestId: string, problem: Problem, problemPageRaw) {

    problemPageRaw.match(/(?<=Input<\/div><pre>\n)[\s\S]*?(?=<\/pre>)/g)
        .forEach(input => {
            problem.tests.push(new Test(input));
        });

    var i = 0;
    problemPageRaw.match(/(?<=Output<\/div><pre>\n)[\s\S]*?(?=<\/pre>)/g)
        .forEach(output => {
            problem.tests[i++].output = output;
        });
    
    return problem;
}


function extractProblemNames(contestId: string, problemset: Array<Problem>, parsedPage) {
    if (parsedPage.tagName == 'a' && 
        parsedPage.rawAttrs.startsWith(`href=\"/contest/${contestId}/problem/`) && 
        parsedPage.parentNode.tagName == 'div') {
            problemset.push(new Problem(
                /(?<=problem\/)(.*)(?=")/.exec(parsedPage.rawAttrs)![0],
                parsedPage.childNodes[0].rawText
            ));
    }
    parsedPage.childNodes.forEach(node => extractProblemNames(contestId, problemset, node));
}

function showTagNames(parsedPage: any) {
    if (parsedPage.tagName == 'a') console.log(parsedPage);
    parsedPage.childNodes.forEach(node => {
        showTagNames(node);
    });
}

function getRawPage(url: string): Promise<string> {
    return new Promise<any>(
        function (resolve, reject) {
            const request = new XMLHttpRequest();
            request.onload = function () {
                if (this.status === 200) {
                    resolve(this.responseText);
                } else {
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
