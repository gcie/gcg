#!/usr/bin/env node

import gcg from 'commander';
import { codeforcesInit } from './src/codeforcesInit';
import { Initializer } from './src/initializer';
import { Validator } from './src/validate';
import { codeforcesSetLogin } from './src/codeforcesLogin';

gcg.version('2.1.1', '-v, --version')
    // .option('--overwrite', 'overwrite existing files')


gcg
    .command('init <task>')
    .description('initialize task')
    .option('-o, --overwrite', 'overwrite existing files')
    .option('-i, --input-only', 'only create .in tests, skip .out')
    .option('-s, --silent', 'run silenty (no logging)')
    .action((task, cmd) => {
        const interactive = new Initializer(cmd, task);
        interactive.start();
    });
    
gcg
    .command('run <task>')
    .description('run task on it\'s tests. if no custom folder or test are specified, it runs on all tests in \'tests\' directory that start with <task> and on all tests in \'tests\\<task>\' directory.')
    .option('--no-compile', 'disable compiling before running on tests')
    .option('-f, --folder <folder>', 'set test folder path. defaults to \'tests\\<task>\'')
    .option('-t, --test <testname>', 'run on chosen test only')
    .option('--std <std>', 'c++ standard for compiler. Defaults to c++17', 'c++17')
    .action((task, cmd) => {
        const validator = new Validator(cmd, task);
        validator.start();
    });


gcg
    .command('cf <id>')
    .description('prepare folder for Codeforces\'s contest with specified id')
    .action(codeforcesInit);

gcg
    .command('add');

gcg
    .command('login [handle]')
    .description('login to Codeforces')
    .action((handle) => { codeforcesSetLogin(handle) });

gcg
    .on('command:*', function () {
        console.error('Invalid command: %s\nSee --help for a list of available commands.', gcg.args.join(' '));
        process.exit(1);
    });

gcg
    .parse(process.argv);


