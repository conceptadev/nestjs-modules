import { RepositoryContextInterface } from '@concepta/nestjs-repository';

import { InvitationEventPayloadInterface } from '../../../../../domain/events/interfaces/invitation-event-payload.interface';
import { InvitationEmailTemplateSettings } from '../../../../../domain/policies/invitation-email.policy';
import {
  SendAcceptedEmailCommandInterface,
  SendInvitationEmailCommandInterface,
} from '../../../../../domain/ports/invitation-email.port';

export class NoopSendInvitationEmailCommand
  implements SendInvitationEmailCommandInterface
{
  constructor(params: SendInvitationEmailCommandInterface) {
    Object.assign(this, params);
  }

  ctx!: RepositoryContextInterface;
  invitation!: InvitationEventPayloadInterface;
  passcode!: string;
  tokenExp!: Date;
  from!: string;
  baseUrl!: string;
  template!: InvitationEmailTemplateSettings;
}

export class NoopSendAcceptedEmailCommand
  implements SendAcceptedEmailCommandInterface
{
  constructor(params: SendAcceptedEmailCommandInterface) {
    Object.assign(this, params);
  }

  ctx!: RepositoryContextInterface;
  invitation!: InvitationEventPayloadInterface;
  from!: string;
  template!: InvitationEmailTemplateSettings;
}
