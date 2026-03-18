import { AuditInterface } from '../../../audit/interfaces/audit.interface';
import { ReferenceIdInterface } from '../../../reference/interfaces/reference-id.interface';
import { ReferenceVersionInterface } from '../../../reference/interfaces/reference-version.interface';

import { RoleInterface } from './role.interface';

export interface RoleEntityInterface
  extends ReferenceIdInterface,
    ReferenceVersionInterface,
    RoleInterface,
    AuditInterface {}
