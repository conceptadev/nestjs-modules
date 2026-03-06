import { isString } from 'class-validator';

import { ReferenceId } from '@concepta/nestjs-common';

import { RoleException } from '../exceptions/role.exception';

export function assertRoleId(value: unknown): asserts value is ReferenceId {
  if (!isString(value) || value.trim() === '') {
    throw new RoleException({
      message: 'Expected role id to be a non-empty string, got %s',
      messageParams: [typeof value],
    });
  }
}
