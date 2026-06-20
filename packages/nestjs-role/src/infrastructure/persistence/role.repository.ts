import { PlainLiteralObject } from '@nestjs/common';

import { ReferenceId } from '@concepta/nestjs-core';
import { RepositoryInterface, Where } from '@concepta/nestjs-repository';

import { Role } from '../../domain/aggregates/role';
import { RoleEntityInterface } from '../../domain/interfaces/role-entity.interface';
import { RoleRepositoryInterface } from '../../domain/repositories/role-repository.interface';

import { RoleMapper } from './role.mapper';

export class RoleRepository implements RoleRepositoryInterface {
  constructor(
    protected readonly repository: RepositoryInterface<RoleEntityInterface>,
    private readonly mapper: RoleMapper,
  ) {}

  async get(ctx: PlainLiteralObject, id: ReferenceId): Promise<Role | null> {
    const w = Where.for<RoleEntityInterface>();

    const entity = await this.repository.findOne({
      where: w.eq('id', id),
      ctx,
    });

    return entity ? this.mapper.toDomain(entity) : null;
  }

  async save(ctx: PlainLiteralObject, role: Role): Promise<void> {
    role.stampUpdated();
    await this.repository.upsert(this.mapper.toPersistence(role), { ctx });
  }

  async remove(ctx: PlainLiteralObject, role: Role): Promise<void> {
    await this.repository.delete(this.mapper.toPersistence(role), { ctx });
  }
}
