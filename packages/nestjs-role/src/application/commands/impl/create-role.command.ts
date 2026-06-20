import { PlainLiteralObject } from '@nestjs/common';
import { Command } from '@nestjs/cqrs';

import { Role, RoleCreateProps } from '../../../domain/aggregates/role';

export class CreateRoleCommand extends Command<Role> {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly namespace: string,
    public readonly dto: RoleCreateProps,
  ) {
    super();
  }
}
