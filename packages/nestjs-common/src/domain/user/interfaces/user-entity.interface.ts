import { AuditInterface } from '../../../audit/interfaces/audit.interface';
import { ReferenceIdInterface } from '../../../reference/interfaces/reference-id.interface';
import { ReferenceVersionInterface } from '../../../reference/interfaces/reference-version.interface';

import { UserInterface } from './user.interface';

export interface UserEntityInterface
  extends ReferenceIdInterface,
    ReferenceVersionInterface,
    UserInterface,
    AuditInterface {}
