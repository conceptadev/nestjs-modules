import { PlainLiteralObject } from '@nestjs/common';

import { PasswordStorageInterface } from './interfaces/password-storage.interface';

export function isPasswordStorage(
  target: unknown,
): target is PasswordStorageInterface {
  return typeof (target as PlainLiteralObject)?.passwordHash === 'string';
}
