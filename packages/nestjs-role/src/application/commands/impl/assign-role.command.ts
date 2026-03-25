import { PlainLiteralObject } from '@nestjs/common';

export class AssignRoleCommand {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly namespace: string,
    public readonly roleId: string,
    public readonly assigneeId: string,
  ) {}
}
