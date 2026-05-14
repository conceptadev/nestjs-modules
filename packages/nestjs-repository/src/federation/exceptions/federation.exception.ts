import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/rockets-app';

/**
 * Exception thrown during federation query orchestration.
 */
export class FederationException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super(options);
    this.errorCode = 'FEDERATION_ERROR';
  }
}
