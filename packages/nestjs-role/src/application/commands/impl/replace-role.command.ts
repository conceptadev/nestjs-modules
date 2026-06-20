import { PlainLiteralObject } from '@nestjs/common';
import { Command } from '@nestjs/cqrs';

import { ReferenceId } from '@concepta/nestjs-core';

import { Role, RoleCreateProps } from '../../../domain/aggregates/role';

export class ReplaceRoleCommand extends Command<Role> {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly namespace: string,
    public readonly id: ReferenceId,
    public readonly dto: RoleCreateProps,
  ) {
    super();
  }
}
