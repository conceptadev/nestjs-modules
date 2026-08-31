import { type ReferenceId } from '@concepta/nestjs-core';

import { RoleException } from '../exceptions/role.exception.js';

export function assertRoleId(value: unknown): asserts value is ReferenceId {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new RoleException({
      message: 'Expected role id to be a non-empty string, got %s',
      messageParams: [typeof value],
      fault: 'client',
    });
  }
}
