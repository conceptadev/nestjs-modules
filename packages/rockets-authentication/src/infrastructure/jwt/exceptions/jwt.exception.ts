import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/rockets-app';

/**
 * Generic exception.
 */
export class JwtException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super(options);
    this.errorCode = 'JWT_ERROR';
  }
}
