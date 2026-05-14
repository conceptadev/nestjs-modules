import { ReferenceIdInterface } from '@concepta/rockets-app';

import { RoleRelationInterface } from './role-relation.interface';

export interface RoleAssigneesInterface<
  T extends ReferenceIdInterface &
    RoleRelationInterface = ReferenceIdInterface & RoleRelationInterface,
> {
  assignees: T[];
}
