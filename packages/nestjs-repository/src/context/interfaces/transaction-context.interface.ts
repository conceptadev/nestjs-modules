import { PlainLiteralObject } from '@nestjs/common';

import { OverlayRef } from '@concepta/nestjs-common';

import { TransactionManager } from '../../transaction/transaction-manager';

/**
 * Context interface for transaction management.
 *
 * The `trx` field always holds a {@link TransactionManager}.
 * The manager starts inert — no database transactions are opened until
 * explicitly requested via `getOrStart()`.
 */
export interface TransactionContextInterface extends PlainLiteralObject {
  trx: TransactionManager;
}

export const TrxCtx = new OverlayRef<'withTrx', TransactionContextInterface>(
  'withTrx',
);
