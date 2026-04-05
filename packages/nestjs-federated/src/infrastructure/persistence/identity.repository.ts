import { PlainLiteralObject } from '@nestjs/common';

import { ReferenceId } from '@concepta/nestjs-common';
import { RepositoryInterface, Where } from '@concepta/nestjs-repository';

import { Identity } from '../../domain/aggregates/identity';
import { IdentityRepositoryInterface } from '../../domain/repositories/identity-repository.interface';

import { IdentityMapper } from './identity.mapper';
import { IdentityEntityInterface } from './interfaces/identity-entity.interface';

export class IdentityRepository implements IdentityRepositoryInterface {
  constructor(
    protected readonly repository: RepositoryInterface<IdentityEntityInterface>,
    private readonly mapper: IdentityMapper,
  ) {}

  async get(
    ctx: PlainLiteralObject,
    id: ReferenceId,
  ): Promise<Identity | null> {
    const w = Where.for<IdentityEntityInterface>();

    const entity = await this.repository.findOne({
      where: w.eq('id', id),
      ctx,
    });

    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByProviderAndSubject(
    ctx: PlainLiteralObject,
    provider: string,
    subject: string,
  ): Promise<Identity | null> {
    const w = Where.for<IdentityEntityInterface>();

    const entity = await this.repository.findOne({
      where: w.and(w.eq('provider', provider), w.eq('subject', subject)),
      ctx,
    });

    return entity ? this.mapper.toDomain(entity) : null;
  }

  async save(ctx: PlainLiteralObject, identity: Identity): Promise<void> {
    identity.stampUpdated();
    await this.repository.upsert(this.mapper.toPersistence(identity), { ctx });
  }

  async remove(ctx: PlainLiteralObject, identity: Identity): Promise<void> {
    await this.repository.delete(this.mapper.toPersistence(identity), { ctx });
  }
}
