import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/rockets-app';

/**
 * Exception thrown when a transaction times out.
 */
export class TransactionTimeoutException extends RuntimeException {
  constructor(timeoutMs: number, options?: RuntimeExceptionOptions) {
    super({
      message: 'Transaction timeout after %dms',
      messageParams: [timeoutMs],
      ...options,
    });

    this.errorCode = 'TRANSACTION_TIMEOUT';
  }
}
