import { Inject } from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  EventPublisher,
  ICommandHandler,
} from '@nestjs/cqrs';

import { EventContextHost } from '@concepta/nestjs-common';
import { TransactionScope } from '@concepta/nestjs-repository';

import { User } from '../../../domain/aggregates/user';
import { UserRepositoryInterface } from '../../../domain/repositories/user-repository.interface';
import { USER_REPOSITORY_TOKEN } from '../../../user.constants';
import { CreateUserCredentialCommand } from '../impl/create-user-credential.command';
import { CreateUserCommand } from '../impl/create-user.command';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: UserRepositoryInterface,
    private readonly commandBus: CommandBus,
    private readonly eventPublisher: EventPublisher,
    private readonly txScope: TransactionScope,
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const { ctx, dto } = command;
    const userEventContext = new EventContextHost({}, {});

    return this.txScope.run(ctx, async (txCtx) => {
      const user = this.eventPublisher.mergeObjectContext(
        User.create(userEventContext, dto),
      );

      await this.userRepository.save(txCtx, user);

      // create initial credentials if password provided
      if (dto.password) {
        await this.commandBus.execute(
          new CreateUserCredentialCommand(txCtx, user.id, dto.password),
        );
      }

      txCtx.trx.onCommit(() => user.commit());
      txCtx.trx.onRollback(() => user.uncommit());

      return user;
    });
  }
}
