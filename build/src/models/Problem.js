"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Problem {
    constructor(name, description, tests = []) {
        this.name = name;
        this.description = description;
        this.tests = tests;
    }
}
exports.Problem = Problem;
