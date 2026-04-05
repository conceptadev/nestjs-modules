import {
  AuditInterface,
  ReferenceIdInterface,
  ReferenceVersionInterface,
} from '@concepta/nestjs-common';

import { RoleAssignmentInterface } from './role-assignment.interface';

export interface RoleAssignmentEntityInterface
  extends ReferenceIdInterface,
    ReferenceVersionInterface,
    RoleAssignmentInterface,
    AuditInterface {}
