#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const minimist_1 = __importDefault(require("minimist"));
const init_1 = require("./src/init");
const validate_1 = require("./src/validate");
const args = minimist_1.default(process.argv.slice(2), { default: { compile: true, tasks: 5, tests: 2 } });
if (args._[0] === 'init' || args['init']) {
    init_1.init(args);
}
else if (args._[0].length == 1) {
    validate_1.validate(args);
}
