import { Injectable, PlainLiteralObject, Type } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { InvitationEventPayloadInterface } from '../events/interfaces/invitation-event-payload.interface';
import {
  InvitationEmailPolicy,
  InvitationEmailTemplateSettings,
} from '../policies/invitation-email.policy';

export interface SendInvitationEmailCommandInterface {
  ctx: PlainLiteralObject;
  invitation: InvitationEventPayloadInterface;
  passcode: string;
  tokenExp: Date;
  from: string;
  baseUrl: string;
  template: InvitationEmailTemplateSettings;
}

export interface SendAcceptedEmailCommandInterface {
  ctx: PlainLiteralObject;
  invitation: InvitationEventPayloadInterface;
  from: string;
  template: InvitationEmailTemplateSettings;
}

export interface InvitationEmailPortSettings {
  sendInvitationCommand: Type<SendInvitationEmailCommandInterface>;
  sendAcceptedCommand: Type<SendAcceptedEmailCommandInterface>;
}

@Injectable()
export class InvitationEmailPort {
  constructor(
    private readonly portSettings: InvitationEmailPortSettings,
    private readonly policy: InvitationEmailPolicy,
    private readonly commandBus: CommandBus,
  ) {}

  async sendInvitation(
    ctx: PlainLiteralObject,
    invitation: InvitationEventPayloadInterface,
    params: {
      passcode: string;
      tokenExp: Date;
    },
  ): Promise<void> {
    const { from, baseUrl } = this.policy;
    return this.commandBus.execute(
      new this.portSettings.sendInvitationCommand({
        ctx,
        invitation,
        from,
        baseUrl,
        template: this.policy.invitationTemplate,
        ...params,
      }),
    );
  }

  async sendAccepted(
    ctx: PlainLiteralObject,
    invitation: InvitationEventPayloadInterface,
  ): Promise<void> {
    const { from } = this.policy;
    return this.commandBus.execute(
      new this.portSettings.sendAcceptedCommand({
        ctx,
        invitation,
        from,
        template: this.policy.acceptedTemplate,
      }),
    );
  }
}
