import { PlainLiteralObject } from '@nestjs/common';

export class ClearCachesByAssigneeCommand {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly namespace: string,
    public readonly assigneeId: string,
  ) {}
}
