import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/rockets-app';

export class UserException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super(options);
    this.errorCode = 'USER_ERROR';
  }
}
