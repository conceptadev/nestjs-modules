import { ReferenceId } from '@concepta/nestjs-common';

/**
 * Belongs to role.
 */
export interface RoleRelationInterface<T extends ReferenceId = ReferenceId> {
  roleId: T;
}
