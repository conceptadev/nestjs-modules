import { PlainLiteralObject } from '@nestjs/common';

import { RoleCreateProps } from '../../../domain/aggregates/role';

export class CreateRoleCommand {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly namespace: string,
    public readonly dto: RoleCreateProps,
  ) {}
}
