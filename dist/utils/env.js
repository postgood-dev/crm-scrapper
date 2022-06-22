"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSafeEnv = void 0;
const getSafeEnv = (key, defaultValue) => {
    const result = process.env[key];
    if (result != null) {
        return result;
    }
    else if (defaultValue !== undefined) {
        return defaultValue;
    }
    else {
        throw new Error(`Env variable "${key}" is required`);
    }
};
exports.getSafeEnv = getSafeEnv;
//# sourceMappingURL=env.js.map