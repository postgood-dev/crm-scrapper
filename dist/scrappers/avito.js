"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAd = exports.StatusType = void 0;
const T = require("fp-ts/lib/Task");
const O = require("fp-ts/lib/Option");
const TE = require("fp-ts/lib/TaskEither");
const RNA = require("fp-ts/lib/ReadonlyNonEmptyArray");
const RA = require("fp-ts/lib/ReadonlyArray");
const dates = require("date-fns");
const locale_1 = require("date-fns/locale");
const function_1 = require("fp-ts/lib/function");
const index_1 = require("../index");
const axios_1 = require("../utils/axios");
const cheerio = require("cheerio");
const cheerio_1 = require("../utils/cheerio");
const request_1 = require("../utils/request");
var StatusType;
(function (StatusType) {
    StatusType["ACTIVE"] = "ACTIVE";
    StatusType["ARCHIVED"] = "ARCHIVED";
    StatusType["INACTIVE"] = "INACTIVE";
    StatusType["OLD"] = "OLD";
    StatusType["REJECTED"] = "REJECTED";
    StatusType["BLOCKED"] = "BLOCKED";
    StatusType["DRAFT"] = "DRAFT";
    StatusType["MODERATION"] = "MODERATION";
    StatusType["NOT_FOUND"] = "NOT_FOUND";
    StatusType["UNKNOWN"] = "UNKNOWN";
})(StatusType = exports.StatusType || (exports.StatusType = {}));
const checkAd = (options) => {
    const request = (0, request_1.initRequest)(options);
    const check = (url, attemps = 0) => {
        return (0, function_1.pipe)((0, axios_1.axiosCallToTask)(() => request.get(url, {
            headers: {
                path: new URL(url).pathname,
            },
        })), TE.map(({ data }) => cheerio.load(data)), TE.map(($) => {
            const PARSE_VIEWS_RE = /\s*(?<views>\d*)(\s\(\+(?<add>\d*)\))?\s*/;
            const isArchived = (0, function_1.pipe)($('.item-closed-warning__content'), cheerio_1.getCheerioOptionElement, O.chain((el) => el.text().includes('Объявление снято с публикации')
                ? O.some(true)
                : O.none), O.isSome);
            const fullUrl = (0, function_1.pipe)($('meta[property="og:url"]'), cheerio_1.getCheerioOptionElement, O.chain((el) => O.fromNullable(el.attr('content'))), O.getOrElseW(() => null));
            const isActive = (0, function_1.pipe)($('[data-marker="item-view/favorite-button"]'), cheerio_1.getCheerioOptionElement, O.isSome);
            const hasModerationWarning = (0, function_1.pipe)($('.item-view-warning .has-bold'), cheerio_1.getCheerioOptionElement, O.chain((el) => el
                .text()
                .includes('Сейчас это объявление проверяется модераторами.')
                ? O.some(true)
                : O.none), O.isSome);
            const isRejected = (0, function_1.pipe)($('.item-view-warning_color-red .has-bold'), cheerio_1.getCheerioOptionElement, O.chain((el) => el.text().includes('Это объявление отклонено модератором')
                ? O.some(true)
                : O.none), O.isSome);
            const YESTERDAY_TIME_RE = /(В|в)чера в /;
            const TODAY_TIME_RE = /(С|с)егодня в /;
            const todayDate = new Date();
            const yestardayDate = new Date(new Date().setDate(new Date().getDate() - 1));
            const dateTime = (0, function_1.pipe)($('[class*="style-item-metadata-date"]'), cheerio_1.getCheerioOptionElement, O.map((el) => el.text().trim()), O.map((str) => TODAY_TIME_RE.test(str)
                ? dates.parse(str.replace(TODAY_TIME_RE, ''), 'HH:mm', todayDate, { locale: locale_1.ru })
                : YESTERDAY_TIME_RE.test(str)
                    ? dates.parse(str.replace(YESTERDAY_TIME_RE, ''), 'HH:mm', yestardayDate, { locale: locale_1.ru })
                    : dates.parse(str, 'd MMMM в HH:mm', todayDate, { locale: locale_1.ru })), O.map((date) => dates.getTime(date)), O.getOrElseW(() => null));
            const views = (0, function_1.pipe)($('[data-marker=item-view/item-metadata-views]'), cheerio_1.getCheerioOptionElement, O.map((el) => {
                var _a;
                const regExpRes = PARSE_VIEWS_RE.exec(el.text());
                return regExpRes != null
                    ? parseInt(((_a = regExpRes.groups) === null || _a === void 0 ? void 0 : _a.views) || '0')
                    : 0;
            }), O.getOrElseW(() => null));
            const price = (0, function_1.pipe)($('.js-item-price'), cheerio_1.getCheerioOptionElement, O.chain((el) => O.fromNullable(el.attr('content'))), O.map(parseInt), O.getOrElseW(() => null));
            const params = (0, function_1.pipe)($('[class*="params-paramsList"]'), cheerio_1.getCheerioOptionElement, O.map((el) => {
                const result = [];
                el.each((_i, o) => {
                    const [key, value] = $(o).text().split(':');
                    result.push({
                        key: key.trim(),
                        value: value.trim().replace('\n', ''),
                    });
                });
                return result;
            }), O.getOrElseW(() => []));
            const findParamByKey = (p) => (key) => (0, function_1.pipe)(p, RNA.fromArray, O.chain(RA.findFirst((a) => a.key === key)));
            const area = (0, function_1.pipe)('Общая площадь', findParamByKey(params), O.map((o) => o.value), O.map(parseInt), O.getOrElseW(() => null));
            const [floor, maxFloor] = (0, function_1.pipe)('Этаж', findParamByKey(params), O.map((o) => o.value.split('из')), O.map(RA.map((i) => parseInt(i))), O.getOrElseW(() => [null, null]));
            const notFound = (0, function_1.pipe)($('[class*="style-item-view-content"]'), cheerio_1.getCheerioOptionElement, O.isNone);
            const roomType = (0, function_1.pipe)($('[data-marker="item-view/title-info"]'), cheerio_1.getCheerioOptionElement, O.map((el) => el.text()), O.map((title) => /^1-к/.test(title)
                ? index_1.RoomType.ONE_ROOM
                : /^2-к/.test(title)
                    ? index_1.RoomType.TWO_ROOM
                    : /^3-к/.test(title)
                        ? index_1.RoomType.THREE_ROOM
                        : /^Квартира-студия/.test(title)
                            ? index_1.RoomType.STUDIO
                            : null), O.getOrElseW(() => null));
            const description = (0, function_1.pipe)($('[data-marker="item-view/item-description"]'), cheerio_1.getCheerioOptionElement, O.chain((el) => O.fromNullable(el.text())), O.map((str) => str.trim()), O.getOrElseW(() => null));
            const imageUrls = (0, function_1.pipe)($('[class*="image-frame-wrapper"]'), cheerio_1.getCheerioOptionElement, O.map((el) => {
                const result = [];
                el.each((_i, o) => {
                    const url = $(o).attr('data-url');
                    if (url != null) {
                        result.push(url);
                    }
                });
                return result;
            }), O.getOrElseW(() => []));
            return Object.assign({}, (0, index_1.nullAdResult)(), {
                status: notFound
                    ? StatusType.NOT_FOUND
                    : hasModerationWarning
                        ? StatusType.MODERATION
                        : isActive
                            ? StatusType.ACTIVE
                            : isArchived
                                ? StatusType.ARCHIVED
                                : isRejected
                                    ? StatusType.REJECTED
                                    : StatusType.UNKNOWN,
                views: views,
                url: fullUrl,
                price,
                dateTime,
                params,
                area,
                floor,
                maxFloor,
                roomType,
                description,
                imageUrls,
            });
        }), TE.orElseW((e) => {
            var _a, _b;
            if ((0, axios_1.isAxiosErorr)(e) && ((_a = e.response) === null || _a === void 0 ? void 0 : _a.status) === 404) {
                if (attemps >= 3) {
                    return TE.right(Object.assign({}, (0, index_1.nullAdResult)(), {
                        status: StatusType.NOT_FOUND,
                    }));
                }
                else {
                    return (0, function_1.pipe)(check(url, attemps + 1), T.delay(1000));
                }
            }
            if (((_b = options.scraperProvider) === null || _b === void 0 ? void 0 : _b.type) === index_1.ScraperProvider.SCRAPER_API) {
                return TE.left(e);
            }
            if (attemps >= 3) {
                return TE.left(e);
            }
            return (0, function_1.pipe)(check(url, attemps + 1), T.delay(1000));
        }));
    };
    return check;
};
exports.checkAd = checkAd;
//# sourceMappingURL=avito.js.map