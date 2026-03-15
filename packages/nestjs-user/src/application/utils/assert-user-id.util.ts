import { isString } from 'class-validator';

import { ReferenceId } from '@concepta/nestjs-common';

import { UserException } from '../../domain/exceptions/user.exception';

export function assertUserId(value: unknown): asserts value is ReferenceId {
  if (!isString(value) || value.trim() === '') {
    throw new UserException({
      message: 'Expected user id to be a non-empty string, got %s',
      messageParams: [typeof value],
    });
  }
}
