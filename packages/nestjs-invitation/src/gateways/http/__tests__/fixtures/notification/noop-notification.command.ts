import { PlainLiteralObject } from '@nestjs/common';

import { InvitationEventPayloadInterface } from '../../../../../domain/events/interfaces/invitation-event-payload.interface';
import {
  SendAcceptedNotificationCommandInterface,
  SendInvitationNotificationCommandInterface,
} from '../../../../../domain/ports/invitation-notification.port';

export class NoopSendInvitationNotificationCommand
  implements SendInvitationNotificationCommandInterface
{
  constructor(params: SendInvitationNotificationCommandInterface) {
    Object.assign(this, params);
  }

  ctx!: PlainLiteralObject;
  invitation!: InvitationEventPayloadInterface;
  passcode!: string;
  tokenExp!: Date;
}

export class NoopSendAcceptedNotificationCommand
  implements SendAcceptedNotificationCommandInterface
{
  constructor(params: SendAcceptedNotificationCommandInterface) {
    Object.assign(this, params);
  }

  ctx!: PlainLiteralObject;
  invitation!: InvitationEventPayloadInterface;
}
