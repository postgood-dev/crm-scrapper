import * as E from 'fp-ts/lib/Either';

import { checkAd } from '../../../../scrappers/avito';
import { getSafeEnv } from '../../../../utils/env';

jest.setTimeout(50000);

describe('Check Avito Ad', () => {
  test('Active ad without scrapper', async () => {
    const url = getSafeEnv('CHECK_AVITO_URL');

    const res = await checkAd({})(url)();
    expect(E.isRight(res)).toBe(true);
    if (E.isRight(res)) {
      expect(res.right.status).toBe('ACTIVE');
      expect(res.right.views).not.toBe(null);
      expect(res.right.url).not.toBe(null);
      expect(res.right.status).not.toBe(null);
      expect(res.right.roomType).not.toBe(null);
      expect(res.right.price).not.toBe(null);
      expect(res.right.maxFloor).not.toBe(null);
      expect(res.right.floor).not.toBe(null);
      expect(res.right.description).not.toBe(null);
      expect(res.right.dateTime).not.toBe(null);
      expect(res.right.area).not.toBe(null);
      expect(res.right.params.length).toBeGreaterThan(0);
      expect(res.right.imageUrls.length).toBeGreaterThan(0);
    }
  });
});
