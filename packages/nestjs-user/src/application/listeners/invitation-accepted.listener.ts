import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import {
  AppContextHost,
  INVITATION_MODULE_CATEGORY_USER_KEY,
  InvitationAcceptedEventPayloadInterface,
  RepositoryContextInterface,
} from '@concepta/nestjs-common';
import { EventAsyncInterface, EventListenerOn } from '@concepta/nestjs-event';

import { UserException } from '../../domain/exceptions/user.exception';
import { UserSettingsInterface } from '../../infrastructure/config/interfaces/user-settings.interface';
import { USER_MODULE_SETTINGS_TOKEN } from '../../user.constants';
import { UpdateUserCommand } from '../commands/impl/update-user.command';

@Injectable()
export class InvitationAcceptedListener
  extends EventListenerOn<
    EventAsyncInterface<InvitationAcceptedEventPayloadInterface, boolean>
  >
  implements OnModuleInit
{
  constructor(
    @Inject(USER_MODULE_SETTINGS_TOKEN)
    private settings: UserSettingsInterface,
    private readonly commandBus: CommandBus,
  ) {
    super();
  }

  onModuleInit() {
    if (this.settings.invitationAcceptedEvent) {
      this.on(this.settings.invitationAcceptedEvent);
    }
  }

  async listen(
    event: EventAsyncInterface<
      InvitationAcceptedEventPayloadInterface,
      boolean
    >,
  ) {
    if (
      event.payload.invitation.category !== INVITATION_MODULE_CATEGORY_USER_KEY
    ) {
      return true;
    }

    const { userId } = event.payload.invitation;

    if (typeof userId !== 'string') {
      throw new UserException({
        message:
          'The invitation accepted event payload received has invalid content. The payload must have the "invitation.userId" property.',
      });
    }

    const ctx = AppContextHost.merge<RepositoryContextInterface>(() => ({}));

    await this.commandBus.execute(
      new UpdateUserCommand(ctx, userId, { active: true }),
    );

    return true;
  }
}
