export function isString(val: any): val is string {
  return Object.prototype.toString.call(val) === '[object String]';
}

export function jsonParse(string: string) {
  if (!string) return null;
  if (!isString(string)) return string;
  try {
    // eslint-disable-next-line code-spec-unid/no-json-parse-or-json-stringify
    const data = JSON.parse(string);
    return data;
  } catch (error) {
    return null;
  }
}

export function jsonStringify(
  value: any,
  replacer?: (this: any, key: string, value: any) => any,
  space?: string | number,
) {
  try {
    // eslint-disable-next-line code-spec-unid/no-json-parse-or-json-stringify
    return JSON.stringify(value, replacer, space);
  } catch (error) {
    return '';
  }
}