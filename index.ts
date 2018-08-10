#!/usr/bin/env node

import { execFile } from 'child_process';
import * as fs from 'fs';
import minimist from 'minimist';
import { init } from './src/init';
import { validate } from './src/validate';

const args: minimist.ParsedArgs = minimist(process.argv.slice(2), { default: { compile: true, tasks: 5, tests: 2 }});

if(args._[0] === 'init' || args['init']) {
    init(args);
} else if(args._[0].length == 1) {
    validate(args);
}


