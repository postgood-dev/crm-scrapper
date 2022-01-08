import {
  checkAd as avitoCheckAd,
  StatusType as AvitoStatusType,
} from './scrappers/avito';

export enum RoomType {
  ONE_ROOM = 'one-room',
  TWO_ROOM = 'two-room',
  THREE_ROOM = 'three-room',
  FOUR_ROOM = 'four-room',
  FIVE_ROOM = 'five-room',
  STUDIO = 'studio',
  EURO_TWO_ROOM = 'euro-two-room',
}

export type Param = { key: string; value: string };

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

export const nullAdResult = (): AdResult => ({
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

export enum ScraperProvider {
  SCRAPER_API = 'SCRAPER_API',
}

export interface Options {
  scraperProvider?: { type: ScraperProvider; apiKey: string };
}

export namespace Avito {
  export const checkAd = avitoCheckAd;
  export import StatusType = AvitoStatusType;
}
