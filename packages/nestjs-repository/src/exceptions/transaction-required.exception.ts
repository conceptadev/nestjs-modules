import {
  RuntimeException,
  type RuntimeExceptionOptions,
} from '@concepta/nestjs-core';

/**
 * Exception thrown when MANDATORY propagation requires a transaction but none exists.
 */
export class TransactionRequiredException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: 'Transaction required but none active (propagation: MANDATORY)',
      ...options,
    });

    this.errorCode = 'TRANSACTION_REQUIRED';
  }
}
