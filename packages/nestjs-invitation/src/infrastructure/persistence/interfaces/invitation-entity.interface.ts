import {
  AuditInterface,
  ReferenceActiveInterface,
  ReferenceIdInterface,
  ReferenceVersionInterface,
} from '@concepta/nestjs-core';

import { InvitationInterface } from '../../../domain/interfaces/invitation.interface';

export interface InvitationEntityInterface
  extends
    ReferenceIdInterface,
    ReferenceVersionInterface,
    ReferenceActiveInterface,
    InvitationInterface,
    AuditInterface {}
