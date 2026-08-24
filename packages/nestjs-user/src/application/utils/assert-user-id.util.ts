import { type ReferenceId } from '@concepta/nestjs-core';

import { UserException } from '../../domain/exceptions/user.exception.js';

export function assertUserId(value: unknown): asserts value is ReferenceId {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new UserException({
      message: 'Expected user id to be a non-empty string, got %s',
      messageParams: [typeof value],
    });
  }
}
