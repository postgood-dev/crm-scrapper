"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.axiosCallToTask = exports.isAxiosErorr = exports.UnknownAxiosError = void 0;
const TE = require("fp-ts/lib/TaskEither");
class UnknownAxiosError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.UnknownAxiosError = UnknownAxiosError;
const isAxiosErorr = (value) => value.isAxiosError === true;
exports.isAxiosErorr = isAxiosErorr;
function axiosCallToTask(lazyPromise) {
    return TE.tryCatch(lazyPromise, (e) => {
        return (0, exports.isAxiosErorr)(e)
            ? e
            : e instanceof Error
                ? new UnknownAxiosError((e === null || e === void 0 ? void 0 : e.message) || 'Unknown error')
                : new UnknownAxiosError('Unknown error');
    });
}
exports.axiosCallToTask = axiosCallToTask;
//# sourceMappingURL=axios.js.map