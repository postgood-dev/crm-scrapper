import * as TE from 'fp-ts/lib/TaskEither';
import { AxiosError, AxiosResponse } from 'axios';
import { Lazy } from 'fp-ts/lib/function';
export declare class UnknownAxiosError extends Error {
    constructor(message?: string);
}
export declare const isAxiosErorr: (value: any) => value is AxiosError<any, any>;
export declare function axiosCallToTask<E extends AxiosError, R extends AxiosResponse>(lazyPromise: Lazy<Promise<R>>): TE.TaskEither<E | UnknownAxiosError, R>;
