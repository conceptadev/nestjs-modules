import {
  AuditInterface,
  ReferenceIdInterface,
  ReferenceVersionInterface,
} from '@concepta/nestjs-common';

import { UserCredentialInterface } from './user-credential.interface';

export interface UserCredentialEntityInterface
  extends ReferenceIdInterface,
    ReferenceVersionInterface,
    UserCredentialInterface,
    AuditInterface {}
