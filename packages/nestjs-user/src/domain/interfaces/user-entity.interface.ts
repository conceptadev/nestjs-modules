import {
  AuditInterface,
  ReferenceIdInterface,
  ReferenceVersionInterface,
} from '@concepta/nestjs-common';

import { UserInterface } from './user.interface';

export interface UserEntityInterface
  extends ReferenceIdInterface,
    ReferenceVersionInterface,
    UserInterface,
    AuditInterface {}
