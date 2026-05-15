import {
  AuditInterface,
  ReferenceIdInterface,
  ReferenceVersionInterface,
} from '@concepta/rockets-app';

import { RoleAssignmentInterface } from './role-assignment.interface';

export interface RoleAssignmentEntityInterface
  extends ReferenceIdInterface,
    ReferenceVersionInterface,
    RoleAssignmentInterface,
    AuditInterface {}
