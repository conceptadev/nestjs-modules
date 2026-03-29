import { ExecutionContext, Inject, Injectable } from '@nestjs/common';

import {
  AppContextHost,
  ContextOverlayInterface,
  getAppContext,
} from '@concepta/nestjs-common';

import {
  TransactionContextInterface,
  TrxCtx,
} from '../context/interfaces/transaction-context.interface';

import {
  TransactionFactoryRegistry,
  TRANSACTION_FACTORY_REGISTRY,
} from './transaction-factory-registry';
import { TransactionManager } from './transaction-manager';

/**
 * Transaction context overlay.
 *
 * Creates a {@link TransactionManager} per request and defines it as
 * the `withTrx` overlay on the {@link AppContextHost}. The manager
 * starts inert — no database transactions are opened until
 * {@link TransactionScope} explicitly calls `getOrStart()`.
 */
@Injectable()
export class TransactionContextOverlay
  implements ContextOverlayInterface<'withTrx', TransactionContextInterface>
{
  readonly ref = TrxCtx;

  constructor(
    @Inject(TRANSACTION_FACTORY_REGISTRY)
    private readonly registry: TransactionFactoryRegistry,
  ) {}

  resolve(): TransactionContextInterface {
    return { trx: new TransactionManager(this.registry) };
  }

  attach(context: ExecutionContext): AppContextHost {
    const request = context.switchToHttp().getRequest();
    const ctx = getAppContext(request);
    ctx.defineOverlay(this, context);
    return ctx;
  }
}
