import {
  ReferenceId,
  RepositoryContextInterface,
} from '@concepta/nestjs-common';

import { Role } from '../aggregates/role';

export interface RoleRepositoryInterface {
  get(ctx: RepositoryContextInterface, id: ReferenceId): Promise<Role | null>;

  save(ctx: RepositoryContextInterface, role: Role): Promise<void>;

  remove(ctx: RepositoryContextInterface, role: Role): Promise<void>;
}
