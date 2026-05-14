import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/rockets-app';

export class TokenException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super(options);
    this.errorCode = 'TOKEN_ERROR';
  }
}
