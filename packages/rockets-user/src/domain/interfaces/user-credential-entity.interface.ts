import {
  AuditInterface,
  ReferenceIdInterface,
  ReferenceVersionInterface,
} from '@concepta/rockets-app';

import { UserCredentialInterface } from './user-credential.interface';

export interface UserCredentialEntityInterface
  extends ReferenceIdInterface,
    ReferenceVersionInterface,
    UserCredentialInterface,
    AuditInterface {}
