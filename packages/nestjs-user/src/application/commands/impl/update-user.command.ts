import { PlainLiteralObject } from '@nestjs/common';

import { ReferenceId } from '@concepta/nestjs-common';

import { UserUpdatableInterface } from '../../../domain/interfaces/user-updatable.interface';

export class UpdateUserCommand {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly id: ReferenceId,
    public readonly dto: Partial<UserUpdatableInterface>,
  ) {}
}
