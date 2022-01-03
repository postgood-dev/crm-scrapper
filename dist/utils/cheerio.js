"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCheerioOptionElement = void 0;
const O = require("fp-ts/lib/Option");
const getCheerioOptionElement = (el) => (el.length > 0 ? O.some(el) : O.none);
exports.getCheerioOptionElement = getCheerioOptionElement;
//# sourceMappingURL=cheerio.js.map