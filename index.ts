#!/usr/bin/env node

import minimist from 'minimist';
import { Initializer } from './src/init';
import { Validator } from './src/validate';
import { Interactive } from './src/interactive';

const args: minimist.ParsedArgs = minimist(process.argv.slice(2), {
    default: { 
        compile: true,
        log: true,
        interactive: true,
        tasks: 5,
        tests: 2 
    }
});

if(args._[0] === 'init' || args._[0] === 'i') {
    if(args.interactive) {
        const interactive = new Interactive(args);
        interactive.start();
    } else {
        const initializer = new Initializer(args);
        initializer.start();
    }
} else if(args._[0] === 'run' || args._[0] === 'r') {
    const validator = new Validator(args);
    validator.start();
} else {
}


