import * as E from 'fp-ts/lib/Either';
import { ScraperProvider } from '../../../..';

import { checkAd } from '../../../../scrappers/avito';
import { getSafeEnv } from '../../../../utils/env';

jest.setTimeout(50000);

describe('Check Avito Ad', () => {
  test('Active ad without scrapper', async () => {
    const url = getSafeEnv('CHECK_AVITO_URL');

    const res = await checkAd({})(url)();
    expect(E.isRight(res)).toBe(true);
  });

  test('Active ad witht scrapper', async () => {
    const url = getSafeEnv('CHECK_AVITO_URL');

    const res = await checkAd({
      scraperProvider: {
        type: ScraperProvider.SCRAPER_API,
        apiKey: getSafeEnv('SCRAPER_API_KEY'),
      },
    })(url)();
    expect(E.isRight(res)).toBe(true);
  });
});
