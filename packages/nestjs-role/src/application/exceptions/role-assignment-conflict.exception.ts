import { HttpStatus } from '@nestjs/common';

import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-common';

import { RoleException } from './role.exception';

export class RoleAssignmentConflictException extends RoleException {
  context: RuntimeException['context'] & {
    roleId: string;
    assigneeId: string;
  };

  constructor(
    roleId: string,
    assigneeId: string,
    options?: RuntimeExceptionOptions,
  ) {
    super({
      message: 'Role %s is already assigned to assignee %s.',
      messageParams: [roleId, assigneeId],
      httpStatus: HttpStatus.CONFLICT,
      ...options,
    });

    this.errorCode = 'ROLE_ASSIGNMENT_CONFLICT_ERROR';

    this.context = {
      ...super.context,
      roleId,
      assigneeId,
    };
  }
}
