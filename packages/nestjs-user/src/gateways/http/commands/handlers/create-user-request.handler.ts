import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { CreateUserCommand } from '../../../../application/commands/impl/create-user.command';
import { User } from '../../../../domain/aggregates/user';
import { CreateUserRequest } from '../impl/create-user.request';

@Injectable()
export class CreateUserRequestHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(command: CreateUserRequest) {
    const { context, dto } = command;
    const user = await this.commandBus.execute<CreateUserCommand, User>(
      new CreateUserCommand(context, dto),
    );
    return user.toPlain();
  }
}
