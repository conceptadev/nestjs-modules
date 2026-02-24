import { ActionEnum } from '@concepta/nestjs-common';
import { CompositeSpecification } from '@concepta/nestjs-hook';

import { CrudSpecContextInterface } from './interfaces/crud-spec-context.interface';

/**
 * Specification that matches specific actions.
 *
 * Actions are high-level categories (CREATE, READ, UPDATE, DELETE)
 * that group related CRUD operations.
 *
 * @example
 * ```typescript
 * // Match single action
 * CrudSpec.action(ActionEnum.CREATE)
 *
 * // Match multiple actions
 * CrudSpec.action(ActionEnum.UPDATE, ActionEnum.DELETE)
 *
 * // Using shortcuts
 * CrudSpec.isCreate()
 * CrudSpec.isRead()
 * CrudSpec.isUpdate()
 * CrudSpec.isDelete()
 * ```
 */
export class ActionSpecification extends CompositeSpecification<CrudSpecContextInterface> {
  constructor(private readonly actions: ActionEnum[]) {
    super();
  }

  isSatisfiedBy(context: CrudSpecContextInterface): boolean {
    return this.actions.includes(context.action);
  }
}
