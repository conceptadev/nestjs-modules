import { type AssigneeRelationInterface } from '@concepta/nestjs-core';

import { type RoleRelationInterface } from './role-relation.interface';

export interface RoleAssignmentInterface
  extends AssigneeRelationInterface, RoleRelationInterface {}
