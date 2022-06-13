"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_1 = require("src/utils/cookie");
describe('setCookie', () => {
    test('Basic convert "set-cookie" response header to Map<string, string>', () => {
        const cookies = [
            'u=2t43pkdz.pgzsqr.1aw4b7ewgtgw0; path=/; expires=Thu, 30-Dec-2038 11:23:11 GMT; HttpOnly; Max-Age=536112000; secure; domain=.avito.ru',
            'v=1641208991; path=/; expires=Mon, 03-Jan-22 11:53:11 GMT; HttpOnly; Max-Age=1800; secure; domain=.avito.ru; SameSite=Lax',
            'dfp_group=49; expires=Mon, 03-Jan-2022 11:33:11 GMT; Max-Age=600; path=/; domain=.avito.ru; secure; HttpOnly; SameSite=Lax',
            'sx=H4sIAAAAAAACA4uOBQApu0wNAgAAAA%3D%3D; expires=Mon, 10-Jan-2022 11:23:11 GMT; Max-Age=604800; path=/; domain=.avito.ru; secure; HttpOnly; SameSite=Lax',
            'value=moskva; expires=Tue, 04-Jan-2022 11:23:11 GMT; Max-Age=86400; path=/; domain=.avito.ru; secure; HttpOnly; SameSite=Lax',
            'empty=; expires=Thu, 01-Jan-1970 00:00:01 GMT; Max-Age=0; path=/; secure; HttpOnly; SameSite=Lax',
        ];
        const result = (0, cookie_1.setCookie)(cookies);
        expect(result).toBeInstanceOf(Map);
        expect(result.size).toBe(6);
        expect(result.get('empty=;')).toBe('empty=; expires=Thu, 01-Jan-1970 00:00:01 GMT; Max-Age=0; path=/; secure; HttpOnly; SameSite=Lax');
        expect(result.get('value=moskva;')).toBe('value=moskva; expires=Tue, 04-Jan-2022 11:23:11 GMT; Max-Age=86400; path=/; domain=.avito.ru; secure; HttpOnly; SameSite=Lax');
    });
    test('Empty array', () => {
        const result = (0, cookie_1.setCookie)([]);
        expect(result).toBeInstanceOf(Map);
        expect(result.size).toBe(0);
    });
    test('Incorrect strings', () => {
        const result = (0, cookie_1.setCookie)(['abc', 'bla bla bla']);
        expect(result).toBeInstanceOf(Map);
        expect(result.size).toBe(0);
    });
});
describe('getCookie', () => {
    test('Convert Map<string, string> to "cookie" request header', () => {
        const test = new Map();
        test.set('value=moskva;', 'value=moskva; expires=Tue, 04-Jan-2022 11:23:11 GMT; Max-Age=86400; path=/; domain=.avito.ru; secure; HttpOnly; SameSite=Lax');
        test.set('anotherValue=2;', 'anotherValue=2; expires=Tue, 04-Jan-2022 11:23:11 GMT; Max-Age=86400; path=/; domain=.avito.ru; secure; HttpOnly; SameSite=Lax');
        const result = (0, cookie_1.getCookie)(test);
        expect(result).toBe('value=moskva; anotherValue=2');
    });
});
//# sourceMappingURL=cookie.spec.js.map