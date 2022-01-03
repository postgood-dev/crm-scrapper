import * as TE from 'fp-ts/lib/TaskEither';
import { AxiosError, AxiosResponse } from 'axios';
import { Lazy } from 'fp-ts/lib/function';

export class UnknownAxiosError extends Error {
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const isAxiosErorr = (value: any): value is AxiosError =>
  value.isAxiosError === true;

export function axiosCallToTask<E extends AxiosError, R extends AxiosResponse>(
  lazyPromise: Lazy<Promise<R>>,
): TE.TaskEither<E | UnknownAxiosError, R> {
  return TE.tryCatch(
    lazyPromise,

    (e) => {
      return isAxiosErorr(e)
        ? e
        : e instanceof Error
        ? new UnknownAxiosError(e?.message || 'Unknown error')
        : new UnknownAxiosError('Unknown error');
    },
  );
}
