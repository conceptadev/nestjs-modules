import { HttpStatus } from '@nestjs/common';

import {
  type RuntimeException,
  type RuntimeExceptionOptions,
} from '@concepta/nestjs-core';

import { RoleException } from './role.exception';

export class RoleAssignmentNotFoundException extends RoleException {
  declare context: RuntimeException['context'] & {
    assignmentId: string;
  };

  constructor(assignmentId: string, options?: RuntimeExceptionOptions) {
    super({
      message: 'Role assignment not found for id=%s.',
      messageParams: [assignmentId],
      httpStatus: HttpStatus.NOT_FOUND,
      ...options,
    });

    this.errorCode = 'ROLE_ASSIGNMENT_NOT_FOUND_ERROR';

    this.context = {
      ...this.context,
      assignmentId,
    };
  }
}
