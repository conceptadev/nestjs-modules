import { AuditInterface } from '../../../audit/interfaces/audit.interface';
import { ReferenceIdInterface } from '../../../reference/interfaces/reference-id.interface';
import { ReferenceVersionInterface } from '../../../reference/interfaces/reference-version.interface';

import { UserCredentialInterface } from './user-credential.interface';

export interface UserCredentialEntityInterface
  extends ReferenceIdInterface,
    ReferenceVersionInterface,
    UserCredentialInterface,
    AuditInterface {}
