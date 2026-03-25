import { PlainLiteralObject } from '@nestjs/common';

import { ReferenceId } from '@concepta/nestjs-common';

import { RoleCreateProps } from '../../../domain/aggregates/role';

export class UpdateRoleCommand {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly namespace: string,
    public readonly id: ReferenceId,
    public readonly dto: Partial<RoleCreateProps>,
  ) {}
}
