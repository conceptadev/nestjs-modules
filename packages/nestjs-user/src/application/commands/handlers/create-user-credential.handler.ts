import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { EventContextHost } from '@concepta/nestjs-common';
import { TransactionScope } from '@concepta/nestjs-repository';

import { UserCredentials } from '../../../domain/aggregates/user-credentials';
import { UserCredentialsService } from '../../../domain/services/user-credentials.service';
import { CreateUserCredentialCommand } from '../impl/create-user-credential.command';

@CommandHandler(CreateUserCredentialCommand)
export class CreateUserCredentialHandler
  implements ICommandHandler<CreateUserCredentialCommand, UserCredentials>
{
  constructor(
    private readonly userCredentialsService: UserCredentialsService,
    private readonly txScope: TransactionScope,
  ) {}

  async execute(
    command: CreateUserCredentialCommand,
  ): Promise<UserCredentials> {
    const { ctx, userId, password } = command;

    return this.txScope.run(ctx, async () => {
      const eventContext = new EventContextHost({}, {});

      return this.userCredentialsService.setPassword(
        ctx,
        eventContext,
        userId,
        password,
      );
    });
  }
}
