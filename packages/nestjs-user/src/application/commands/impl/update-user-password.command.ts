import { PlainLiteralObject } from '@nestjs/common';

import { PasswordUpdateInterface, ReferenceId } from '@concepta/nestjs-common';

export class UpdateUserPasswordCommand {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly userId: ReferenceId,
    public readonly passwordDto: PasswordUpdateInterface,
  ) {}
}
