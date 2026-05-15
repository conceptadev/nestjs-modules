import {
  AuditInterface,
  ReferenceIdInterface,
  ReferenceVersionInterface,
} from '@concepta/rockets-app';

import { UserInterface } from './user.interface';

export interface UserEntityInterface
  extends ReferenceIdInterface,
    ReferenceVersionInterface,
    UserInterface,
    AuditInterface {}
