import { AssigneeRelationInterface } from '@concepta/nestjs-common';

import { RoleRelationInterface } from './role-relation.interface';

export interface RoleAssignmentInterface
  extends AssigneeRelationInterface,
    RoleRelationInterface {}
