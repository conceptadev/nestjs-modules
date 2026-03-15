import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { UserCreatableInterface, UserInterface } from '@concepta/nestjs-common';
import { CrudCreateCommand } from '@concepta/nestjs-crud';

import { CreateUserCommand } from '../../../../application/commands/impl/create-user.command';
import { User } from '../../../../domain/aggregates/user';

@Injectable()
export class CreateUserRequestHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(
    command: CrudCreateCommand<UserInterface, UserCreatableInterface>,
  ): Promise<UserInterface> {
    const { context, dto } = command;
    const user = await this.commandBus.execute<CreateUserCommand, User>(
      new CreateUserCommand(context, dto),
    );
    return user.toPlain();
  }
}
