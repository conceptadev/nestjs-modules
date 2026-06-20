import {
  AuditInterface,
  ReferenceIdInterface,
  ReferenceVersionInterface,
} from '@concepta/nestjs-core';

import { InvitationInterface } from '../../interfaces/invitation.interface';

export interface InvitationEventPayloadInterface
  extends
    ReferenceIdInterface,
    ReferenceVersionInterface,
    InvitationInterface,
    AuditInterface {}
