import {
  AuditInterface,
  ReferenceIdInterface,
  ReferenceVersionInterface,
} from '@concepta/nestjs-common';

import { IdentityInterface } from '../../../domain/interfaces/identity.interface';

export interface IdentityEntityInterface
  extends ReferenceIdInterface,
    ReferenceVersionInterface,
    IdentityInterface,
    AuditInterface {}
