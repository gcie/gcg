"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CFData {
    constructor(handle, password, page, xuser_cookie, xcsrf_token) {
        this.handle = handle;
        this.password = password;
        this.page = page;
        this.xuser_cookie = xuser_cookie;
        this.xcsrf_token = xcsrf_token;
    }
}
exports.CFData = CFData;
