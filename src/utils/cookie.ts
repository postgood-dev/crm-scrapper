const cookieNameRe = /^([\w-_]*)/;

const cookieNameValueRe = /^(([\w-_]*)=([a-zA-Z0-9_.%;]*))/;

export const setCookie = (cookieString: string[] = []): Map<string, string> =>
  cookieString.reduce((acc: Map<string, string>, cur: string) => {
    const matchValue = cur.match(cookieNameValueRe);
    if (matchValue == null) {
      return acc;
    }
    const cookieValue = matchValue[4];
    const key = matchValue[0];
    if (cookieValue === '' || cookieValue === ';') {
      acc.delete(key);
      return acc;
    }
    return acc.set(key, cur);
  }, new Map());

export const getCookie = (cookieMap: Map<string, string> = new Map()): string =>
  Array.from(cookieMap.values())
    .map((item) => {
      const matchValue = item.match(cookieNameValueRe);
      if (matchValue == null) {
        return item;
      } else {
        return matchValue[0];
      }
    })
    .join(' ')
    .slice(0, -1);

export const getCookieValue = (cookie: string): string | null => {
  const matchValue = cookie.match(cookieNameValueRe);
  if (matchValue != null) {
    return matchValue[3];
  } else {
    return null;
  }
};
