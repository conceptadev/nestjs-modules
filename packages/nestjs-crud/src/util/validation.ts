import { isNumber } from '@nestjs/common/utils/shared.utils';

export const isStringFull = (val: unknown): val is string =>
  typeof val === 'string' && val.length > 0;

export const isArrayStrings = (val: unknown): boolean =>
  Array.isArray(val) && val.length > 0 && val.every((v) => isStringFull(v));

export const isValue = (val: unknown): boolean =>
  isStringFull(val) ||
  isNumber(val) ||
  typeof val === 'boolean' ||
  val instanceof Date;

export const hasValue = (val: unknown): boolean =>
  Array.isArray(val) && val.length > 0
    ? val.every((o) => isValue(o))
    : isValue(val);

const ISO_DATE_REGEX =
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/;

export const isDateString = (val: string): boolean =>
  isStringFull(val) && ISO_DATE_REGEX.test(val) && !isNaN(Date.parse(val));
