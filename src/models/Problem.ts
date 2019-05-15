import { Test } from './Test';

export class Problem {
    constructor(public name: string, public description: string, public tests: Array<Test> = []) { }
}
