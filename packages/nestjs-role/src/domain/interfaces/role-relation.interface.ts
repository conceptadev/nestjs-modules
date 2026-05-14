import { ReferenceId } from '@concepta/rockets-app';

/**
 * Belongs to role.
 */
export interface RoleRelationInterface<T extends ReferenceId = ReferenceId> {
  roleId: T;
}
