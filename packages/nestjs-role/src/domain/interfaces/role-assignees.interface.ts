import { ReferenceIdInterface } from '@concepta/nestjs-core';

import { RoleRelationInterface } from './role-relation.interface';

export interface RoleAssigneesInterface<
  T extends ReferenceIdInterface & RoleRelationInterface =
    ReferenceIdInterface & RoleRelationInterface,
> {
  assignees: T[];
}
