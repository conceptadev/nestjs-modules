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

export class UserCredentialsRepository
  implements UserCredentialsRepositoryInterface
{
  constructor(
    protected readonly repository: RepositoryInterface<UserCredentialEntityInterface>,
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

    return entity ? UserCredentials.toInstance(entity) : null;
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

    return entities.map(UserCredentials.toInstance);
  }

  async save(
    ctx: RepositoryContextInterface,
    entry: UserCredentials,
  ): Promise<void> {
    const entity = await this.repository.upsert(entry.toPlain(), { ctx });
    entry.hydrate(entity);
  }
}
