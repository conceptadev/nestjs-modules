import { HttpStatus } from '@nestjs/common';

import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/rockets-app';

import { RoleException } from './role.exception';

export class RoleAssignmentsConflictException extends RoleException {
  context: RuntimeException['context'] & {
    assigneeId: string;
  };

  constructor(assigneeId: string, options?: RuntimeExceptionOptions) {
    super({
      message: 'One or more roles are already assigned to assignee %s.',
      messageParams: [assigneeId],
      httpStatus: HttpStatus.CONFLICT,
      ...options,
    });

    this.errorCode = 'ROLE_ASSIGNMENTS_CONFLICT_ERROR';

    this.context = {
      ...super.context,
      assigneeId,
    };
  }
}
