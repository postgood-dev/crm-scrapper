"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCookieValue = exports.getCookie = exports.setCookie = void 0;
const cookieNameRe = /^([\w-_]*)/;
const cookieNameValueRe = /^(([\w-_]*)=([a-zA-Z0-9_.%;]*))/;
const setCookie = (cookieString = []) => cookieString.reduce((acc, cur) => {
    const matchValue = cur.match(cookieNameValueRe);
    if (matchValue == null) {
        return acc;
    }
    const cookieValue = matchValue[4];
    const key = matchValue[0];
    if (cookieValue === '' || cookieValue === ';') {
        acc.delete(key);
        return acc;
    }
    return acc.set(key, cur);
}, new Map());
exports.setCookie = setCookie;
const getCookie = (cookieMap = new Map()) => Array.from(cookieMap.values())
    .map((item) => {
    const matchValue = item.match(cookieNameValueRe);
    if (matchValue == null) {
        return item;
    }
    else {
        return matchValue[0];
    }
})
    .join(' ')
    .slice(0, -1);
exports.getCookie = getCookie;
const getCookieValue = (cookie) => {
    const matchValue = cookie.match(cookieNameValueRe);
    if (matchValue != null) {
        return matchValue[3];
    }
    else {
        return null;
    }
};
exports.getCookieValue = getCookieValue;
//# sourceMappingURL=cookie.js.map