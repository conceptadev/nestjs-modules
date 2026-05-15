import { Inject } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TransactionScope } from '@concepta/rockets-repository';

import { UserCredentials } from '../../../domain/aggregates/user-credentials';
import { UserRepositoryInterface } from '../../../domain/repositories/user-repository.interface';
import { USER_REPOSITORY_TOKEN } from '../../../user.constants';
import { UserNotFoundException } from '../../exceptions/user-not-found.exception';
import { CreateUserCredentialCommand } from '../impl/create-user-credential.command';
import { SetUserPasswordCommand } from '../impl/set-user-password.command';

@CommandHandler(SetUserPasswordCommand)
export class SetUserPasswordHandler
  implements ICommandHandler<SetUserPasswordCommand, UserCredentials>
{
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: UserRepositoryInterface,
    private readonly commandBus: CommandBus,
    private readonly txScope: TransactionScope,
  ) {}

  async execute(command: SetUserPasswordCommand): Promise<UserCredentials> {
    const { ctx, userId, password } = command;
    return this.txScope.run(ctx, async (txCtx) => {
      // verify user exists
      const user = await this.userRepository.get(txCtx, userId);

      if (!user) {
        throw new UserNotFoundException({ id: userId });
      }

      return this.commandBus.execute(
        new CreateUserCredentialCommand(txCtx, userId, password),
      );
    });
  }
}
