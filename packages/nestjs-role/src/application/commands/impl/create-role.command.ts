import { RepositoryContextInterface } from '@concepta/nestjs-common';

import { RoleCreateProps } from '../../../domain/aggregates/role';

export class CreateRoleCommand {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly dto: RoleCreateProps,
  ) {}
}
