import { ReferenceId } from '@concepta/nestjs-common';
import { RepositoryContextInterface } from '@concepta/nestjs-repository';

import { RoleCreateProps } from '../../../domain/aggregates/role';

export class ReplaceRoleCommand {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly id: ReferenceId,
    public readonly dto: RoleCreateProps,
  ) {}
}
