import {
  type AuditInterface,
  type ReferenceIdInterface,
  type ReferenceVersionInterface,
} from '@concepta/nestjs-core';

import { type RoleInterface } from './role.interface';

export interface RoleEntityInterface
  extends
    ReferenceIdInterface,
    ReferenceVersionInterface,
    RoleInterface,
    AuditInterface {}
