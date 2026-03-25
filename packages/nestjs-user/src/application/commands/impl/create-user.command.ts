import { PlainLiteralObject } from '@nestjs/common';

import { UserCreatableInterface } from '@concepta/nestjs-common';

export class CreateUserCommand {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly dto: UserCreatableInterface,
  ) {}
}
