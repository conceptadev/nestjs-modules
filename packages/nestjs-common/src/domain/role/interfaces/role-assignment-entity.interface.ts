import { AuditInterface } from '../../../audit/interfaces/audit.interface';
import { ReferenceIdInterface } from '../../../reference/interfaces/reference-id.interface';
import { ReferenceVersionInterface } from '../../../reference/interfaces/reference-version.interface';

import { RoleAssignmentInterface } from './role-assignment.interface';

export interface RoleAssignmentEntityInterface
  extends ReferenceIdInterface,
    ReferenceVersionInterface,
    RoleAssignmentInterface,
    AuditInterface {}
