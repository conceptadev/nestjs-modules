import { ReferenceId } from '@concepta/nestjs-common';
import { RepositoryContextInterface } from '@concepta/nestjs-repository';

import { Role } from '../aggregates/role';

export interface RoleRepositoryInterface {
  get(ctx: RepositoryContextInterface, id: ReferenceId): Promise<Role | null>;

  save(ctx: RepositoryContextInterface, role: Role): Promise<void>;

  remove(ctx: RepositoryContextInterface, role: Role): Promise<void>;
}
