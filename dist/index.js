"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Avito = exports.ScraperProvider = exports.nullAdResult = exports.RoomType = void 0;
const avito_1 = require("./scrappers/avito");
var RoomType;
(function (RoomType) {
    RoomType["ONE_ROOM"] = "one-room";
    RoomType["TWO_ROOM"] = "two-room";
    RoomType["THREE_ROOM"] = "three-room";
    RoomType["FOUR_ROOM"] = "four-room";
    RoomType["FIVE_ROOM"] = "five-room";
    RoomType["STUDIO"] = "studio";
    RoomType["EURO_TWO_ROOM"] = "euro-two-room";
})(RoomType = exports.RoomType || (exports.RoomType = {}));
const nullAdResult = () => ({
    status: 'NOT_FOUND',
    views: null,
    dateTime: null,
    price: null,
    area: null,
    floor: null,
    maxFloor: null,
    description: null,
    roomType: null,
    url: null,
    imageUrls: [],
    params: [],
});
exports.nullAdResult = nullAdResult;
var ScraperProvider;
(function (ScraperProvider) {
    ScraperProvider["SCRAPER_API"] = "SCRAPER_API";
})(ScraperProvider = exports.ScraperProvider || (exports.ScraperProvider = {}));
var Avito;
(function (Avito) {
    Avito.checkAd = avito_1.checkAd;
    Avito.StatusType = avito_1.StatusType;
})(Avito = exports.Avito || (exports.Avito = {}));
//# sourceMappingURL=index.js.map