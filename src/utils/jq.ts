export const splitJqStrings = (str: unknown) => {
  if (typeof str !== 'string') return [];

  return str.replace(/\"/g, '').split('\n');
};
