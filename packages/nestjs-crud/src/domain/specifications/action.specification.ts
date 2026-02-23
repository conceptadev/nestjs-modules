import { ActionEnum } from '@concepta/nestjs-common';
import { CompositeSpecification } from '@concepta/nestjs-hook';

import { CrudContextInterface } from '../../infrastructure/interceptors/interfaces/crud-context.interface';

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
export class ActionSpecification extends CompositeSpecification<CrudContextInterface> {
  constructor(private readonly actions: ActionEnum[]) {
    super();
  }

  isSatisfiedBy(context: CrudContextInterface): boolean {
    return this.actions.includes(context.action);
  }
}
