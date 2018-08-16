#!/usr/bin/env node

import minimist from 'minimist';
import { Initializer } from './src/init';
import { validate } from './src/validate';

const args: minimist.ParsedArgs = minimist(process.argv.slice(2), {
    default: { 
        compile: true,
        log: true,
        tasks: 5,
        tests: 2 
    }
});

if(args._[0] === 'init' || args['init']) {
    const initializer = new Initializer(args);
    initializer.init();
} else if(args._[0].length == 1) {
    validate(args);
}


