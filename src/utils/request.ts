import axios, { AxiosInstance } from 'axios';
import { Options, ScraperProvider } from '../index';
import { getCookie, setCookie } from './cookie';

export const initRequest = (options: Options = {}): AxiosInstance => {
  const request = axios.create({});
  let cookie: Map<string, string> = new Map();
  request.interceptors.request.use((config) => {
    if (config.headers == null) {
      config.headers = {};
    }

    const parsedCookie = getCookie(cookie);

    config.headers.cookie = parsedCookie;

    if (parsedCookie === '') {
      delete config.headers.cookie;
    }
    return config;
  });

  request.interceptors.response.use((res) => {
    if (res.headers) {
      const cookieString = res.headers['set-cookie'];
      cookie = new Map([...cookie, ...setCookie(cookieString || [])]);
    }
    return res;
  });

  if (
    options.scraperProvider != null &&
    options.scraperProvider.type === ScraperProvider.SCRAPER_API
  ) {
    request.interceptors.request.use((config) => {
      config.headers = {};
      config.url = `http://api.scraperapi.com?api_key=${options.scraperProvider?.apiKey}&url=${config.url}`;
      return config;
    });
  }

  return request;
};
