import { Inject } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import { EventContextHost } from '@concepta/nestjs-common';
import { TransactionScope } from '@concepta/nestjs-repository';

import { User } from '../../../domain/aggregates/user';
import { UserRepositoryInterface } from '../../../domain/repositories/user-repository.interface';
import { USER_REPOSITORY_TOKEN } from '../../../user.constants';
import { UserNotFoundException } from '../../exceptions/user-not-found.exception';
import { UpdateUserCommand } from '../impl/update-user.command';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: UserRepositoryInterface,
    private readonly eventPublisher: EventPublisher,
    private readonly txScope: TransactionScope,
  ) {}

  async execute(command: UpdateUserCommand): Promise<User> {
    const { ctx, id, dto } = command;

    const eventContext = new EventContextHost({}, {});

    return this.txScope.run(ctx, async (trx) => {
      const existing = await this.userRepository.get(ctx, id);

      if (!existing) {
        throw new UserNotFoundException({ id });
      }

      const user = this.eventPublisher.mergeObjectContext(existing);

      user.update(eventContext, dto);

      await this.userRepository.save(ctx, user);

      trx.onCommit(ctx, () => user.commit());
      trx.onRollback(ctx, () => user.uncommit());

      return user;
    });
  }
}
