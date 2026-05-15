import {
  AuditInterface,
  ReferenceIdInterface,
  ReferenceVersionInterface,
} from '@concepta/rockets-app';

import { InvitationInterface } from '../../interfaces/invitation.interface';

export interface InvitationEventPayloadInterface
  extends ReferenceIdInterface,
    ReferenceVersionInterface,
    InvitationInterface,
    AuditInterface {}
