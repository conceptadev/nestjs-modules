import {
  type AuditInterface,
  type ReferenceIdInterface,
  type ReferenceVersionInterface,
} from '@concepta/nestjs-core';

import { type InvitationInterface } from '../../interfaces/invitation.interface';

export interface InvitationEventPayloadInterface
  extends
    ReferenceIdInterface,
    ReferenceVersionInterface,
    InvitationInterface,
    AuditInterface {}
