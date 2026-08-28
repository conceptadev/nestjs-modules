import {
  RuntimeException,
  type RuntimeExceptionOptions,
} from '@concepta/nestjs-core';

/**
 * Exception thrown when committing more than one datasource's transaction
 * and at least one fails partway through. Without real two-phase commit,
 * whatever committed before the failure cannot be undone — the outcome is
 * "heuristic" (mixed/undetermined) rather than atomic across datasources.
 */
export class TransactionHeuristicCommitException extends RuntimeException {
  constructor(
    committedCount: number,
    rolledBackCount: number,
    options?: RuntimeExceptionOptions,
  ) {
    super({
      message:
        'Heuristic commit failure: %d of %d datasource transactions committed before a failure; the remaining %d were rolled back and cannot be committed',
      messageParams: [
        committedCount,
        committedCount + rolledBackCount,
        rolledBackCount,
      ],
      ...options,
    });

    this.errorCode = 'TRANSACTION_HEURISTIC_COMMIT';
  }
}
