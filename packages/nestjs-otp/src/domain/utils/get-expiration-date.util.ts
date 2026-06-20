import { toMilliseconds } from '@concepta/nestjs-core';

import { OtpInvalidExpirationDateException } from '../exceptions/otp-invalid-expiration-date.exception';

export const getExpirationDate = (
  expiresIn: string,
  now: Date = new Date(),
): Date => {
  const expires = toMilliseconds(expiresIn);

  if (!expires) {
    throw new OtpInvalidExpirationDateException();
  }

  return new Date(now.getTime() + expires);
};
