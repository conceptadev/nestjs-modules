import { RepositoryContextInterface } from '@concepta/nestjs-repository';

import { RoleCreateProps } from '../../../domain/aggregates/role';

export class CreateRoleCommand {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly dto: RoleCreateProps,
  ) {}
}
