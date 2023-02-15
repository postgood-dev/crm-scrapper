// import * as fs from 'fs';
// import * as path from 'path';
import * as jq from 'node-jq';
import * as T from 'fp-ts/lib/Task';
import * as O from 'fp-ts/lib/Option';
import * as TE from 'fp-ts/lib/TaskEither';
import * as RNA from 'fp-ts/lib/ReadonlyNonEmptyArray';
import * as RA from 'fp-ts/lib/ReadonlyArray';
import * as R from 'fp-ts/lib/Record';
import { pipe } from 'fp-ts/lib/function';
import {
  Options,
  RoomType,
  AdResult,
  ScraperProvider,
  nullAdResult,
} from '../index';
import {
  axiosCallToTask,
  isAxiosErorr,
  UnknownAxiosError,
} from '../utils/axios';
import * as cheerio from 'cheerio';
import { AxiosError } from 'axios';
import { initRequest } from '../utils/request';
import { sequenceS } from 'fp-ts/lib/Apply';
import { splitJqStrings } from '../utils/jq';

export enum StatusType {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  INACTIVE = 'INACTIVE',
  OLD = 'OLD',
  REJECTED = 'REJECTED',
  BLOCKED = 'BLOCKED',
  DRAFT = 'DRAFT',
  MODERATION = 'MODERATION',
  NOT_FOUND = 'NOT_FOUND',
  UNKNOWN = 'UNKNOWN',
}

export const REJECTED_TITLES = ['Это объявление отклонено модератором'];

type AvitoInitialData = Record<string, unknown>;

export class JqError extends Error {
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

const jqTe = (filter: string) => (obj: Object) =>
  pipe(
    TE.tryCatch(
      () => jq.run(filter, obj, { input: 'json', output: 'json' }),
      (e) => {
        return new JqError((e as any).message || (e as any).toString());
      },
    ),
    TE.map(O.fromNullable),
  );

const extractInitialData = (
  $: cheerio.CheerioAPI,
): O.Option<AvitoInitialData> => {
  const script = $('script:not([src])');

  const result = script.filter((_i, el) => {
    const $el = $(el);
    const hasInitialData = $el.html()?.includes('initialData');
    if (hasInitialData) {
      return true;
    }
    return false;
  });

  return pipe(
    RNA.fromArray(result.toArray()),
    O.chain(RA.head),

    O.chain((el) => {
      const html = $(el).html();
      return O.fromNullable(html);
    }),
    O.chain((str) => {
      const initialDataMatch = str.match(/window\.__initialData__ = "(.*)";/);
      return O.fromNullable(initialDataMatch);
    }),
    O.chain(RA.last),
    O.map((str) => JSON.parse(decodeURIComponent(str))),
  );
};

const getInitialDataBxItem = (data: AvitoInitialData) => {
  const AVITO_BX_ITEM_RE = /^@avito\/bx-item-view:.+$/g;
  return pipe(
    R.toArray(data),
    RNA.fromArray,
    O.chain(RA.findFirst(([key]) => AVITO_BX_ITEM_RE.test(key))),
    O.map(([version, data]) => ({
      version,
      data,
    })),
  );
};

const PARSE_INITIAL_DATA_JQ_SELECTOR = {
  url: '.data.buyerItem.itemSocials.url',
  media: '.data.buyerItem.galleryInfo.media[]?.urls["1280x960"]',
  address: '.data.buyerItem.item.address',
  description: '.data.buyerItem.item.description',
  finishTime: '.data.buyerItem.item.finishTime',
  id: '.data.buyerItem.contactBarInfo.itemId',
  price: '.data.buyerItem.item.price',
  isActive: '.data.buyerItem.item.isActive',
  isArchived: '.data.buyerItem.item.isArchived',
  isBlocked: '.data.buyerItem.item.isBlocked',
  isClosed: '.data.buyerItem.item.isClosed',
  isDeleted: '.data.buyerItem.item.isDeleted',
  isExpired: '.data.buyerItem.item.isExpired',
  isFeesWaiting: '.data.buyerItem.item.isFeesWaiting',
  isFinished: '.data.buyerItem.item.isFinished',
  isInModeration: '.data.buyerItem.item.isInModeration',
  isItemActiveOrUserHasAccess:
    '.data.buyerItem.item.isItemActiveOrUserHasAccess',
  isNewDevelopmentsPromo: '.data.buyerItem.item.isNewDevelopmentsPromo',
  isNoAdsAuto: '.data.buyerItem.item.isNoAdsAuto',
  isRejected: '.data.buyerItem.item.isRejected',
  viewStat: '.data.buyerItem.viewStat',
  userKey: '.data.buyerItem.favoriteSeller.userKey',
  area: '.data.buyerItem.ga[1].area',
  area_kitchen: '.data.buyerItem.ga[1].area_kitchen',
  area_live: '.data.buyerItem.ga[1].area_live',
  categoryId: '.data.buyerItem.ga[1].categoryId',
  categorySlug: '.data.buyerItem.ga[1].categorySlug',
  commission: '.data.buyerItem.ga[1].commission',
  floor: '.data.buyerItem.ga[1].floor',
  floors_count: '.data.buyerItem.ga[1].floors_count',
  house_type: '.data.buyerItem.ga[1].house_type',
  rooms: '.data.buyerItem.ga[1].rooms',
  status: '.data.buyerItem.ga[1].status',
  type: '.data.buyerItem.ga[1].type',
  sellerBadges: '.data.buyerItem.item.sellerBadgeBar.badges[]?.title',
  itemBadges: '.data.buyerItem.item.badgeBar.badges[]?.title',
} as const;

type AvitoParseInitialDataJqResult = {
  [key in keyof typeof PARSE_INITIAL_DATA_JQ_SELECTOR]: O.Option<
    string | object | boolean
  >;
};

const getStatusFromParseInitialData = (
  data: AvitoParseInitialDataJqResult,
): StatusType =>
  pipe(
    {
      isActive: data.isActive,
      isArchived: data.isArchived,
      isBlocked: data.isBlocked,
      isClosed: data.isClosed,
      isDeleted: data.isDeleted,
      isExpired: data.isExpired,
      isFeesWaiting: data.isFeesWaiting,
      isFinished: data.isFinished,
      isInModeration: data.isInModeration,
      isRejected: data.isRejected,
    },
    R.map(
      O.fold(
        () => false,
        (a) => !!a,
      ),
    ),
    (statuses) => {
      if (statuses.isInModeration) {
        return StatusType.MODERATION;
      }

      if (statuses.isActive) {
        return StatusType.ACTIVE;
      }

      if (
        statuses.isArchived ||
        statuses.isClosed ||
        statuses.isFinished ||
        statuses.isExpired ||
        statuses.isDeleted
      ) {
        return StatusType.ARCHIVED;
      }

      if (statuses.isBlocked) {
        return StatusType.BLOCKED;
      }

      if (statuses.isRejected) {
        return StatusType.REJECTED;
      }

      return StatusType.UNKNOWN;
    },
  );

const getRoomTypeFromParseInitialData = (data: AvitoParseInitialDataJqResult) =>
  pipe(
    data.rooms,
    O.chain((rooms) => {
      // map string 1,2,3,4,'Студия' to RoomType
      if (rooms === 'Студия') {
        return O.some(RoomType.STUDIO);
      } else if (rooms === '1') {
        return O.some(RoomType.ONE_ROOM);
      } else if (rooms === '2') {
        return O.some(RoomType.TWO_ROOM);
      } else if (rooms === '3') {
        return O.some(RoomType.THREE_ROOM);
      } else if (rooms === '4') {
        return O.some(RoomType.FOUR_ROOM);
      } else {
        return O.none;
      }
    }),
  );

export const checkAd = (options: Options) => {
  const request = initRequest(options);

  const check = (
    url: string,
    attemps = 0,
  ): TE.TaskEither<UnknownAxiosError | AxiosError, AdResult> => {
    return pipe(
      axiosCallToTask(() =>
        request.get(url, {
          headers: {
            path: new URL(url).pathname,
          },
        }),
      ),

      TE.map(({ data }) => cheerio.load(data, { xmlMode: false })),
      TE.chain(($) => {
        // get script without attr src

        const scriptTag = pipe(
          extractInitialData($),
          O.chain(getInitialDataBxItem),
        );

        return TE.fromOption(() => new Error('Initial data in null'))(
          scriptTag,
        );
      }),
      TE.chainW((initialData) => {
        // fs sync save to the json
        // fs.writeFileSync(
        //   path.join(__dirname, 'initialData.json'),
        //   JSON.stringify(initialData, null, 2),
        //   'utf8',
        // );
        return pipe(
          PARSE_INITIAL_DATA_JQ_SELECTOR,
          R.map(jqTe),
          R.map((f) => f(initialData)),
          sequenceS(TE.ApplicativePar),
          TE.map((r) => ({ ...r, version: initialData.version })),
        );
      }),

      TE.map((r: AvitoParseInitialDataJqResult) => {
        return Object.assign({}, nullAdResult(), {
          status: getStatusFromParseInitialData(r),
          id: O.getOrElseW(() => null)(r.id),
          views: pipe(
            r.viewStat,
            O.chain((a) => O.fromNullable((a as any).totalViews)),
            O.getOrElseW(() => 0),
          ),
          dateTime: O.getOrElseW(() => null)(r.finishTime),
          price: O.getOrElseW(() => null)(r.price),
          area: pipe(
            r.area,
            O.map((s) => parseFloat(s as string)),
            O.getOrElseW(() => null),
          ),
          floor: O.getOrElseW(() => null)(r.floor),
          maxFloor: O.getOrElseW(() => null)(r.floors_count),
          description: O.getOrElseW(() => null)(r.description),
          address: O.getOrElseW(() => null)(r.address),
          imageUrls: pipe(
            r.media,
            O.map(splitJqStrings),
            O.getOrElseW(() => []),
          ),
          badges: pipe(
            [r.sellerBadges, r.itemBadges],
            O.sequenceArray,
            O.map(RA.map(splitJqStrings)),
            O.map(RA.flatten),
            O.map(RA.filter((i) => i !== '')),
            O.getOrElseW(() => []),
          ),
          url: O.getOrElseW(() => null)(r.url),
          roomType: O.getOrElseW(() => null)(
            getRoomTypeFromParseInitialData(r),
          ),
        });
      }),
      TE.orElseW((e) => {
        if (isAxiosErorr(e) && e.response?.status === 404) {
          if (attemps >= 3) {
            return TE.right(
              Object.assign({}, nullAdResult(), {
                status: StatusType.NOT_FOUND,
              }),
            );
          } else {
            return pipe(check(url, attemps + 1), T.delay(1000));
          }
        }
        /**
         * Потому что скрепер выдает ошибку, толко если на его стороне было 429 Rate limit
         */
        if (options.scraperProvider?.type === ScraperProvider.SCRAPER_API) {
          return TE.left(e);
        }

        if (attemps >= 3) {
          return TE.left(e);
        }

        return pipe(check(url, attemps + 1), T.delay(1000));
      }),
    );
  };
  return check;
};
