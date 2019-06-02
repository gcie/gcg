import { Page } from 'puppeteer-core';

export class CFData {
    constructor(
        public handle?: string, 
        public password?: string, 
        public page?: Page,
        public xuser_cookie?: string,
        public xcsrf_token?: string
        ) { }
}