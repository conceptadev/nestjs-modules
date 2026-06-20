import { AssigneeRelationInterface } from '@concepta/nestjs-core';

import { RoleRelationInterface } from './role-relation.interface';

export interface RoleAssignmentCreatableInterface
  extends RoleRelationInterface, AssigneeRelationInterface {}
