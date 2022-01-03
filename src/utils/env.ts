export const getSafeEnv = (key: string, defaultValue?: string): string => {
  const result = process.env[key];

  if (result != null) {
    return result;
  } else if (defaultValue !== undefined) {
    return defaultValue;
  } else {
    throw new Error(`Env variable "${key}" is required`);
  }
};
