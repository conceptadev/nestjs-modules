import {
  ReferenceId,
  RepositoryContextInterface,
} from '@concepta/nestjs-common';

import { RoleCreateProps } from '../../../domain/aggregates/role';

export class UpdateRoleCommand {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly id: ReferenceId,
    public readonly dto: Partial<RoleCreateProps>,
  ) {}
}
