import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  NoopSendInvitationEmailCommand,
  NoopSendAcceptedEmailCommand,
} from './noop-email.command';

@CommandHandler(NoopSendInvitationEmailCommand)
export class NoopSendInvitationEmailHandler
  implements ICommandHandler<NoopSendInvitationEmailCommand>
{
  async execute(): Promise<void> {
    // noop — email not actually sent in tests
  }
}

@CommandHandler(NoopSendAcceptedEmailCommand)
export class NoopSendAcceptedEmailHandler
  implements ICommandHandler<NoopSendAcceptedEmailCommand>
{
  async execute(): Promise<void> {
    // noop — email not actually sent in tests
  }
}
