import {
  AuditInterface,
  ReferenceIdInterface,
  ReferenceVersionInterface,
} from '@concepta/nestjs-core';

import { RoleAssignmentInterface } from './role-assignment.interface';

export interface RoleAssignmentEntityInterface
  extends
    ReferenceIdInterface,
    ReferenceVersionInterface,
    RoleAssignmentInterface,
    AuditInterface {}
