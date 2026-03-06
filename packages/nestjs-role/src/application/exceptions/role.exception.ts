import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-common';

export class RoleException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super(options);
    this.errorCode = 'ROLE_ERROR';
  }
}
