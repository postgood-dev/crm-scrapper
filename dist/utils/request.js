"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initRequest = void 0;
const axios_1 = require("axios");
const index_1 = require("../index");
const cookie_1 = require("./cookie");
const initRequest = (options = {}) => {
    const request = axios_1.default.create({});
    let cookie = new Map();
    request.interceptors.request.use((config) => {
        if (config.headers == null) {
            config.headers = {};
        }
        const parsedCookie = (0, cookie_1.getCookie)(cookie);
        config.headers.cookie = parsedCookie;
        if (parsedCookie === '') {
            delete config.headers.cookie;
        }
        return config;
    });
    request.interceptors.response.use((res) => {
        if (res.headers) {
            const cookieString = res.headers['set-cookie'];
            cookie = new Map([...cookie, ...(0, cookie_1.setCookie)(cookieString || [])]);
        }
        return res;
    });
    if (options.scraperProvider != null &&
        options.scraperProvider.type === index_1.ScraperProvider.SCRAPER_API) {
        request.interceptors.request.use((config) => {
            var _a;
            config.headers = {};
            config.url = `http://api.scraperapi.com?api_key=${(_a = options.scraperProvider) === null || _a === void 0 ? void 0 : _a.apiKey}&url=${config.url}`;
            return config;
        });
    }
    return request;
};
exports.initRequest = initRequest;
//# sourceMappingURL=request.js.map