import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { EventContextHost } from '@concepta/nestjs-common';
import { TransactionScope } from '@concepta/nestjs-repository';

import { UserCredentialsService } from '../../../domain/services/user-credentials.service';
import { UpdateUserCredentialCommand } from '../impl/update-user-credential.command';

@CommandHandler(UpdateUserCredentialCommand)
export class UpdateUserCredentialHandler
  implements ICommandHandler<UpdateUserCredentialCommand, void>
{
  constructor(
    private readonly userCredentialsService: UserCredentialsService,
    private readonly txScope: TransactionScope,
  ) {}

  async execute(command: UpdateUserCredentialCommand): Promise<void> {
    const { ctx, userId, passwordDto } = command;
    return this.txScope.run(ctx, async (txCtx) => {
      const eventContext = new EventContextHost({}, {});

      await this.userCredentialsService.updatePassword(
        txCtx,
        eventContext,
        userId,
        passwordDto.password,
        passwordDto.passwordCurrent,
      );
    });
  }
}
