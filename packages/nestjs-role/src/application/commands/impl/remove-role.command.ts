import { PlainLiteralObject } from '@nestjs/common';
import { Command } from '@nestjs/cqrs';

import { ReferenceId } from '@concepta/nestjs-common';

export class RemoveRoleCommand extends Command<void> {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly namespace: string,
    public readonly id: ReferenceId,
  ) {
    super();
  }
}
