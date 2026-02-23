import { EntityHeaderInterface } from '../../events/headers/interfaces/entity-header.interface';

import { HookContextInterface } from './hook-context.interface';
import { TransactionContextInterface } from './transaction-context.interface';

/**
 * Context interface for repository operations.
 *
 * Extends TransactionContextInterface for transaction support
 * and HookContextInterface for hook access.
 */
export interface RepositoryContextInterface
  extends TransactionContextInterface,
    HookContextInterface,
    EntityHeaderInterface {}
