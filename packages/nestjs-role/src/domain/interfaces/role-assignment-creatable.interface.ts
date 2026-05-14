import { AssigneeRelationInterface } from '@concepta/rockets-app';

import { RoleRelationInterface } from './role-relation.interface';

export interface RoleAssignmentCreatableInterface
  extends RoleRelationInterface,
    AssigneeRelationInterface {}
