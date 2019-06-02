#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = __importDefault(require("commander"));
const codeforcesInit_1 = require("./src/codeforcesInit");
const initializer_1 = require("./src/initializer");
const validate_1 = require("./src/validate");
const codeforcesLogin_1 = require("./src/codeforcesLogin");
commander_1.default.version('2.1.1', '-v, --version');
commander_1.default
    .command('init <task>')
    .description('initialize task')
    .option('-o, --overwrite', 'overwrite existing files')
    .option('-i, --input-only', 'only create .in tests, skip .out')
    .option('-s, --silent', 'run silenty (no logging)')
    .action((task, cmd) => {
    const interactive = new initializer_1.Initializer(cmd, task);
    interactive.start();
});
commander_1.default
    .command('run <task>')
    .description('run task on it\'s tests. if no custom folder or test are specified, it runs on all tests in \'tests\' directory that start with <task> and on all tests in \'tests\\<task>\' directory.')
    .option('--no-compile', 'disable compiling before running on tests')
    .option('-f, --folder <folder>', 'set test folder path. defaults to \'tests\\<task>\'')
    .option('-t, --test <testname>', 'run on chosen test only')
    .option('--std <std>', 'c++ standard for compiler. Defaults to c++17', 'c++17')
    .action((task, cmd) => {
    const validator = new validate_1.Validator(cmd, task);
    validator.start();
});
commander_1.default
    .command('cf <id>')
    .description('prepare folder for Codeforces\'s contest with specified id')
    .action(codeforcesInit_1.codeforcesInit);
commander_1.default
    .command('add');
commander_1.default
    .command('login [handle]')
    .description('login to Codeforces')
    .action((handle) => { codeforcesLogin_1.codeforcesSetLogin(handle); });
commander_1.default
    .on('command:*', function () {
    console.error('Invalid command: %s\nSee --help for a list of available commands.', commander_1.default.args.join(' '));
    process.exit(1);
});
commander_1.default
    .parse(process.argv);
