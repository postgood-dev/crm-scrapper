import * as TE from 'fp-ts/lib/TaskEither';
import { Options, AdResult } from '../index';
import { UnknownAxiosError } from '../utils/axios';
import { AxiosError } from 'axios';
export declare enum StatusType {
    ACTIVE = "ACTIVE",
    ARCHIVED = "ARCHIVED",
    INACTIVE = "INACTIVE",
    OLD = "OLD",
    REJECTED = "REJECTED",
    BLOCKED = "BLOCKED",
    DRAFT = "DRAFT",
    MODERATION = "MODERATION",
    NOT_FOUND = "NOT_FOUND",
    UNKNOWN = "UNKNOWN"
}
export declare const checkAd: (options: Options) => (url: string, attemps?: number) => TE.TaskEither<UnknownAxiosError | AxiosError, AdResult>;
