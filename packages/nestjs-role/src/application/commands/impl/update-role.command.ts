import { PlainLiteralObject } from '@nestjs/common';
import { Command } from '@nestjs/cqrs';

import { ReferenceId } from '@concepta/nestjs-common';

import { Role, RoleCreateProps } from '../../../domain/aggregates/role';

export class UpdateRoleCommand extends Command<Role> {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly namespace: string,
    public readonly id: ReferenceId,
    public readonly dto: Partial<RoleCreateProps>,
  ) {
    super();
  }
}
