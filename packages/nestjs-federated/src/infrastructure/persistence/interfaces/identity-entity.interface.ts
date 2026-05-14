import {
  AuditInterface,
  ReferenceIdInterface,
  ReferenceVersionInterface,
} from '@concepta/rockets-app';

import { IdentityInterface } from '../../../domain/interfaces/identity.interface';

export interface IdentityEntityInterface
  extends ReferenceIdInterface,
    ReferenceVersionInterface,
    IdentityInterface,
    AuditInterface {}
