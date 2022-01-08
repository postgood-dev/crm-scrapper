import * as T from 'fp-ts/lib/Task';
import * as O from 'fp-ts/lib/Option';
import * as TE from 'fp-ts/lib/TaskEither';
import * as RNA from 'fp-ts/lib/ReadonlyNonEmptyArray';
import * as RA from 'fp-ts/lib/ReadonlyArray';
import * as dates from 'date-fns';
import { ru } from 'date-fns/locale';
import { pipe } from 'fp-ts/lib/function';
import {
  Options,
  Param,
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
import { getCheerioOptionElement } from '../utils/cheerio';
import { AxiosError } from 'axios';
import { initRequest } from '../utils/request';

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

      TE.map(({ data }) => cheerio.load(data)),
      TE.map(($) => {
        const PARSE_VIEWS_RE = /\s*(?<views>\d*)(\s\(\+(?<add>\d*)\))?\s*/;

        const isArchived = pipe(
          $('.item-closed-warning__content'),
          getCheerioOptionElement,
          O.chain((el) =>
            el.text().includes('Объявление снято с публикации')
              ? O.some(true)
              : O.none,
          ),
          O.isSome,
        );
        const fullUrl: string | null = pipe(
          $('meta[property="og:url"]'),
          getCheerioOptionElement,
          O.chain((el) => O.fromNullable(el.attr('content'))),
          O.getOrElseW(() => null),
        );

        const isActive = pipe(
          $('.add-favorite'),
          getCheerioOptionElement,
          O.isSome,
        );

        const hasModerationWarning = pipe(
          $('.item-view-warning .has-bold'),
          getCheerioOptionElement,
          O.chain((el) =>
            el
              .text()
              .includes('Сейчас это объявление проверяется модераторами.')
              ? O.some(true)
              : O.none,
          ),
          O.isSome,
        );
        const isRejected = pipe(
          $('.item-view-warning_color-red .has-bold'),
          getCheerioOptionElement,
          O.chain((el) =>
            el.text().includes('Это объявление отклонено модератором')
              ? O.some(true)
              : O.none,
          ),
          O.isSome,
        );

        const dateTime = pipe(
          $('.title-info-metadata-item-redesign'),
          getCheerioOptionElement,
          O.map((el) => el.text().trim()),
          O.map((str) =>
            dates.parse(str, 'd MMMM в HH:mm', new Date(), { locale: ru }),
          ),
          O.map((date) => dates.getTime(date)),
          O.getOrElseW(() => null),
        );

        const views = pipe(
          $('.title-info-metadata-views'),
          getCheerioOptionElement,
          O.map((el) => {
            const regExpRes = PARSE_VIEWS_RE.exec(el.text());
            return regExpRes != null
              ? parseInt(regExpRes.groups?.views || '0')
              : 0;
          }),
          O.getOrElseW(() => null),
        );

        const price = pipe(
          $('.js-item-price'),
          getCheerioOptionElement,
          O.chain((el) => O.fromNullable(el.attr('content'))),
          O.map(parseInt),
          O.getOrElseW(() => null),
        );

        const params = pipe(
          $('.item-params-list-item'),
          getCheerioOptionElement,
          O.map((el) => {
            const result: Param[] = [];
            el.each((i, o) => {
              const [key, value] = $(o).text().split(':');

              result.push({
                key: key.trim(),
                value: value.trim().replace('\n', ''),
              });
            });
            return result;
          }),
          O.getOrElseW(() => []),
        );

        const findParamByKey =
          (p: Param[]) =>
          (key: string): O.Option<Param> =>
            pipe(p, RNA.fromArray, O.chain(RA.findFirst((a) => a.key === key)));

        const area = pipe(
          'Общая площадь',
          findParamByKey(params),
          O.map((o) => o.value),
          O.map(parseInt),
          O.getOrElseW(() => null),
        );

        const [floor, maxFloor] = pipe(
          'Этаж',
          findParamByKey(params),
          O.map((o) => o.value.split('из')),
          O.map(RA.map((i) => parseInt(i))),
          O.getOrElseW(() => [null, null]),
        );

        const notFound = pipe(
          $('.js-item-view'),
          getCheerioOptionElement,
          O.isNone,
        );

        const roomType = pipe(
          $('.title-info-title-text'),
          getCheerioOptionElement,
          O.map((el) => el.text()),
          O.map((title) =>
            /^1-к/.test(title)
              ? RoomType.ONE_ROOM
              : /^2-к/.test(title)
              ? RoomType.TWO_ROOM
              : /^3-к/.test(title)
              ? RoomType.THREE_ROOM
              : /^Квартира-студия/.test(title)
              ? RoomType.STUDIO
              : null,
          ),
          O.getOrElseW(() => null),
        );

        const description = pipe(
          $('.item-description-html'),
          getCheerioOptionElement,
          O.chain((el) => O.fromNullable(el.text())),
          O.map((str) => str.trim()),
          O.alt(() =>
            pipe(
              getCheerioOptionElement($('.item-description-text')),
              O.chain((el) => O.fromNullable(el.text())),
              O.map((str) => str.trim()),
            ),
          ),
          O.getOrElseW(() => null),
        );

        const imageUrls = pipe(
          $('.js-gallery-img-frame'),
          getCheerioOptionElement,
          O.map((el) => {
            const result: string[] = [];
            el.each((i, o) => {
              const url = $(o).attr('data-url');
              if (url != null) {
                result.push(url);
              }
            });
            return result;
          }),
          O.getOrElseW(() => []),
        );
        return Object.assign({}, nullAdResult(), {
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
      }),
      TE.orElseW((e) => {
        if (isAxiosErorr(e) && e.response?.status === 404) {
          return TE.right(
            Object.assign({}, nullAdResult(), { status: StatusType.NOT_FOUND }),
          );
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
