import { PlainLiteralObject } from '@nestjs/common';

export class IsAssignedRoleQuery {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly namespace: string,
    public readonly roleId: string,
    public readonly assigneeId: string,
  ) {}
}
