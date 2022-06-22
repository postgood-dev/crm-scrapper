import { StatusType as AvitoStatusType } from './scrappers/avito';
export declare enum RoomType {
    ONE_ROOM = "one-room",
    TWO_ROOM = "two-room",
    THREE_ROOM = "three-room",
    FOUR_ROOM = "four-room",
    FIVE_ROOM = "five-room",
    STUDIO = "studio",
    EURO_TWO_ROOM = "euro-two-room"
}
export declare type Param = {
    key: string;
    value: string;
};
export interface AdResult {
    status: string;
    views: number | null;
    dateTime: number | null;
    price: number | null;
    area: number | null;
    floor: number | null;
    maxFloor: number | null;
    description: string | null;
    roomType: RoomType | null;
    url: string | null;
    imageUrls: string[];
    params: Param[];
}
export declare const nullAdResult: () => AdResult;
export declare enum ScraperProvider {
    SCRAPER_API = "SCRAPER_API"
}
export interface Options {
    scraperProvider?: {
        type: ScraperProvider;
        apiKey: string;
    };
}
export declare namespace Avito {
    const checkAd: (options: Options) => (url: string, attemps?: number) => import("fp-ts/lib/TaskEither").TaskEither<import("axios").AxiosError<any, any> | import("./utils/axios").UnknownAxiosError, AdResult>;
    export import StatusType = AvitoStatusType;
}
