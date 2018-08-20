#!/usr/bin/env node

import minimist from 'minimist';
import { Initializer } from './src/init';
import { Validator } from './src/validate';
import { Interactive } from './src/interactive';

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
    initializer.start();
} else if(args._[0] && args._[0].length == 1) {
    const validator = new Validator(args);
    validator.start();
} else {
    const interactive = new Interactive(args);
    interactive.start();
}


