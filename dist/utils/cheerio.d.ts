import * as cheerio from 'cheerio';
import * as O from 'fp-ts/lib/Option';
export declare const getCheerioOptionElement: <T>(el: cheerio.Cheerio<T>) => O.Option<cheerio.Cheerio<T>>;
