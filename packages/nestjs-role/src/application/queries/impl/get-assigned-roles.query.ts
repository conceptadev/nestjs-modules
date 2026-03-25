import { PlainLiteralObject } from '@nestjs/common';

export class GetAssignedRolesQuery {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly namespace: string,
    public readonly assigneeId: string,
  ) {}
}
