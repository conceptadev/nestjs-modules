import { PlainLiteralObject } from '@nestjs/common';

import { ReferenceId, UserUpdatableInterface } from '@concepta/nestjs-common';

export class UpdateUserCommand {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly id: ReferenceId,
    public readonly dto: Partial<UserUpdatableInterface>,
  ) {}
}
