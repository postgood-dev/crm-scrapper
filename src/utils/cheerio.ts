import * as cheerio from 'cheerio';
import * as O from 'fp-ts/lib/Option';

export const getCheerioOptionElement = <T>(
  el: cheerio.Cheerio<T>,
): O.Option<cheerio.Cheerio<T>> => (el.length > 0 ? O.some(el) : O.none);
