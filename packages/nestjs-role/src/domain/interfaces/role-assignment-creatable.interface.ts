import { type AssigneeRelationInterface } from '@concepta/nestjs-core';

import { type RoleRelationInterface } from './role-relation.interface';

export interface RoleAssignmentCreatableInterface
  extends RoleRelationInterface, AssigneeRelationInterface {}
