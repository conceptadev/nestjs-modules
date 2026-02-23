import { Operation } from '@concepta/nestjs-common';
import { CompositeSpecification } from '@concepta/nestjs-hook';

import { CrudContextInterface } from '../../infrastructure/interceptors/interfaces/crud-context.interface';

/**
 * Specification that matches specific CRUD operations.
 *
 * @example
 * ```typescript
 * // Match single operation
 * CrudSpec.operation(Operation.Create)
 *
 * // Match multiple operations
 * CrudSpec.operation(Operation.Create, Operation.Update)
 *
 * // Using shortcut
 * CrudSpec.isQuery() // List, Read
 * CrudSpec.isWrite() // Create, CreateBatch, Update, Replace
 * ```
 */
export class OperationSpecification extends CompositeSpecification<CrudContextInterface> {
  constructor(private readonly operations: Operation[]) {
    super();
  }

  isSatisfiedBy(context: CrudContextInterface): boolean {
    return this.operations.includes(context.operation);
  }
}
