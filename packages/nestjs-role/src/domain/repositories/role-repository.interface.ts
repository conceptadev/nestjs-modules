import { PlainLiteralObject } from '@nestjs/common';

import { ReferenceId } from '@concepta/nestjs-common';

import { Role } from '../aggregates/role';

export interface RoleRepositoryInterface {
  get(ctx: PlainLiteralObject, id: ReferenceId): Promise<Role | null>;

  save(ctx: PlainLiteralObject, role: Role): Promise<void>;

  remove(ctx: PlainLiteralObject, role: Role): Promise<void>;
}
