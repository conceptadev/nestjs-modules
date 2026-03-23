import { ReferenceId } from '@concepta/nestjs-common';
import {
  RepositoryContextInterface,
  RepositoryInterface,
  Where,
} from '@concepta/nestjs-repository';

import { Invitation } from '../../domain/aggregates/invitation';
import { InvitationRepositoryInterface } from '../../domain/repositories/invitation-repository.interface';

import { InvitationEntityInterface } from './interfaces/invitation-entity.interface';
import { InvitationMapper } from './invitation.mapper';

export class InvitationRepository implements InvitationRepositoryInterface {
  constructor(
    protected readonly repository: RepositoryInterface<InvitationEntityInterface>,
    private readonly mapper: InvitationMapper,
  ) {}

  async get(
    ctx: RepositoryContextInterface,
    id: ReferenceId,
  ): Promise<Invitation | null> {
    const w = Where.for<InvitationEntityInterface>();

    const entity = await this.repository.findOne({
      where: w.eq('id', id),
      ctx,
    });

    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findOneByCode(
    ctx: RepositoryContextInterface,
    code: string,
  ): Promise<Invitation | null> {
    const w = Where.for<InvitationEntityInterface>();

    const entity = await this.repository.findOne({
      where: w.eq('code', code),
      ctx,
    });

    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findAllByUserAndCategory(
    ctx: RepositoryContextInterface,
    userId: ReferenceId,
    category: string,
  ): Promise<Invitation[]> {
    const w = Where.for<InvitationEntityInterface>();

    const entities = await this.repository.find({
      where: w.and(w.eq('userId', userId), w.eq('category', category)),
      ctx,
    });

    return entities.map((e) => this.mapper.toDomain(e));
  }

  async save(
    ctx: RepositoryContextInterface,
    invitation: Invitation,
  ): Promise<void> {
    invitation.stampUpdated();
    await this.repository.upsert(this.mapper.toPersistence(invitation), {
      ctx,
    });
  }

  async remove(
    ctx: RepositoryContextInterface,
    invitation: Invitation,
  ): Promise<void> {
    await this.repository.delete(this.mapper.toPersistence(invitation), {
      ctx,
    });
  }

  async removeAll(
    ctx: RepositoryContextInterface,
    invitations: Invitation[],
  ): Promise<void> {
    await this.repository.deleteMany(
      invitations.map((inv) => this.mapper.toPersistence(inv)),
      { ctx },
    );
  }
}
