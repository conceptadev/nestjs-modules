import { PlainLiteralObject } from '@nestjs/common';

export class IsAssignedRolesQuery {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly namespace: string,
    public readonly roleIds: string[],
    public readonly assigneeId: string,
  ) {}
}
