import {
  AuditInterface,
  ReferenceIdInterface,
  ReferenceVersionInterface,
} from '@concepta/nestjs-common';

import { RoleInterface } from './role.interface';

export interface RoleEntityInterface
  extends ReferenceIdInterface,
    ReferenceVersionInterface,
    RoleInterface,
    AuditInterface {}
