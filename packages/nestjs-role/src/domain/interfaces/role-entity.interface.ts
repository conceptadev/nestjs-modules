import {
  AuditInterface,
  ReferenceIdInterface,
  ReferenceVersionInterface,
} from '@concepta/nestjs-core';

import { RoleInterface } from './role.interface';

export interface RoleEntityInterface
  extends
    ReferenceIdInterface,
    ReferenceVersionInterface,
    RoleInterface,
    AuditInterface {}
