import { toMilliseconds } from '@concepta/nestjs-core';

import { CacheInvalidExpiredDateException } from '../exceptions/cache-invalid-expired-date.exception.js';

const getExpirationDate = (
  expiresIn: string | null | undefined,
): Date | null => {
  if (!expiresIn) return null;

  const now = new Date();
  const expires = toMilliseconds(expiresIn);

  if (!expires) throw new CacheInvalidExpiredDateException();

  // add expiration duration (in ms) to current time
  return new Date(now.getTime() + expires);
};

export { getExpirationDate };
