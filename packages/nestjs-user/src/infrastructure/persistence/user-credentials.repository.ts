import {
  OrderBy,
  ReferenceId,
  RepositoryContextInterface,
  RepositoryInterface,
  UserCredentialEntityInterface,
  Where,
} from '@concepta/nestjs-common';

import { UserCredentials } from '../../domain/aggregates/user-credentials';
import { UserCredentialsRepositoryInterface } from '../../domain/repositories/user-credentials-repository.interface';

import { UserCredentialsMapper } from './user-credentials.mapper';

export class UserCredentialsRepository
  implements UserCredentialsRepositoryInterface
{
  constructor(
    protected readonly repository: RepositoryInterface<UserCredentialEntityInterface>,
    private readonly mapper: UserCredentialsMapper,
  ) {}

  async findActiveByUserId(
    ctx: RepositoryContextInterface,
    userId: ReferenceId,
  ): Promise<UserCredentials | null> {
    const w = Where.for<UserCredentialEntityInterface>();

    const entity = await this.repository.findOne({
      where: w.and(w.eq('userId', userId), w.eq('active', true)),
      ctx,
    });

    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByUserId(
    ctx: RepositoryContextInterface,
    userId: ReferenceId,
    limitDate?: Date,
  ): Promise<UserCredentials[]> {
    const w = Where.for<UserCredentialEntityInterface>();

    const conditions = [w.eq('userId', userId)];

    if (limitDate) {
      conditions.push(w.gte('validFrom', limitDate));
    }

    const entities = await this.repository.find({
      where: w.and(...conditions),
      order: [OrderBy.desc<UserCredentialEntityInterface>('validFrom')],
      ctx,
    });

    return entities.map((e) => this.mapper.toDomain(e));
  }

  async save(
    ctx: RepositoryContextInterface,
    entry: UserCredentials,
  ): Promise<void> {
    entry.stampUpdated();
    await this.repository.upsert(this.mapper.toPersistence(entry), { ctx });
  }
}
