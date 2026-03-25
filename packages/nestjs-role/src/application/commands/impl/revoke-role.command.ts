import { PlainLiteralObject } from '@nestjs/common';

export class RevokeRoleCommand {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly namespace: string,
    public readonly roleId: string,
    public readonly assigneeId: string,
  ) {}
}
