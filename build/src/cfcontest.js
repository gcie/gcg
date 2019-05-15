"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const node_html_parser_1 = require("node-html-parser");
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
function cfContest(contestId, cmd) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const sampleProgram = fs_1.readFileSync(__dirname + '/../res/templates/main.cpp');
            const contestPageRaw = yield getRawPage(`http://codeforces.com/contest/${contestId}`);
            const contestPage = node_html_parser_1.parse(contestPageRaw);
            let problemset = [];
            extractProblemNames(contestId, problemset, contestPage);
            problemset.forEach(problem => {
                const filename = './' + problem.name + '.cpp';
                if (cmd.overwrite || !fs_1.existsSync(filename)) {
                    fs_1.writeFileSync(filename, this.sampleProgram);
                    this.logger.log('Created file:', filename);
                }
                if (!fs_1.existsSync('./tests')) {
                    mkdirSync('./tests');
                    this.logger.log("Created directory: ./tests");
                }
                if (!fs_1.existsSync('./tests/' + this.taskname)) {
                    mkdirSync('./tests/' + this.taskname);
                    this.logger.log("Created directory: ./tests/" + this.taskname);
                }
                var testc = 1;
                this.tests.forEach(test => {
                    var inPath = './tests/' + this.taskname + '/' + this.taskname + testc + '.in';
                    var outPath = './tests/' + this.taskname + '/' + this.taskname + testc + '.out';
                    testc++;
                    if (this.commander.overwrite || !fs_1.existsSync(inPath)) {
                        fs_1.writeFileSync(inPath, test.input);
                        this.logger.log('Created file:', inPath);
                    }
                    if (test.output && (this.commander.overwrite || !fs_1.existsSync(outPath))) {
                        fs_1.writeFileSync(outPath, test.output);
                        this.logger.log('Created file:', outPath);
                    }
                });
            });
            console.log(problemset);
        }
        catch (err) {
            console.error(err);
            process.exit();
        }
    });
}
exports.cfContest = cfContest;
function extractProblemNames(contestId, problemset, parsedPage) {
    if (parsedPage.tagName == 'a' &&
        parsedPage.rawAttrs.startsWith(`href=\"/contest/${contestId}/problem/`) &&
        parsedPage.parentNode.tagName == 'div') {
        problemset.push(new Problem(/(?<=problem\/)(.*)(?=")/.exec(parsedPage.rawAttrs)[0], parsedPage.childNodes[0].rawText));
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
