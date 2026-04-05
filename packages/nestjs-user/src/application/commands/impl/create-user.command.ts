import { PlainLiteralObject } from '@nestjs/common';

import { UserCreatableInterface } from '../../../domain/interfaces/user-creatable.interface';

export class CreateUserCommand {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly dto: UserCreatableInterface,
  ) {}
}
