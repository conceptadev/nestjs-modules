import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/rockets-app';

/**
 * Exception for authentication
 */
export class AuthenticationException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super(options);
    this.errorCode = 'AUTHENTICATION_ERROR';
  }
}
