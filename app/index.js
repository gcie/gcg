#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const minimist_1 = __importDefault(require("minimist"));
const init_1 = require("./src/init");
const validate_1 = require("./src/validate");
const interactive_1 = require("./src/interactive");
const fs_1 = require("fs");
const args = minimist_1.default(process.argv.slice(2), {
    default: {
        compile: true,
        log: true,
        interactive: true,
        tasks: 5,
        tests: 2
    }
});
if (args._[0] === 'init' || args._[0] === 'i') {
    if (args.interactive) {
        const interactive = new interactive_1.Interactive(args);
        interactive.start();
    }
    else {
        const initializer = new init_1.Initializer(args);
        initializer.start();
    }
}
else if (args._[0] === 'run' || args._[0] === 'r') {
    const validator = new validate_1.Validator(args);
    validator.start();
}
else if (args._[0] === 'help' || args._[0] === 'h' || !args._[0]) {
    fs_1.readFile('./res/help', (err, data) => {
        console.log(data.toString());
    });
}
