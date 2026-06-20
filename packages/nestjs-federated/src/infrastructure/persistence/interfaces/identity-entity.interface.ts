import {
  AuditInterface,
  ReferenceIdInterface,
  ReferenceVersionInterface,
} from '@concepta/nestjs-core';

import { IdentityInterface } from '../../../domain/interfaces/identity.interface';

export interface IdentityEntityInterface
  extends
    ReferenceIdInterface,
    ReferenceVersionInterface,
    IdentityInterface,
    AuditInterface {}
