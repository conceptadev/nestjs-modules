import {
  ReferenceEmail,
  ReferenceId,
  ReferenceUsername,
  UserEntityInterface,
} from '@concepta/nestjs-common';
import {
  RepositoryContextInterface,
  RepositoryInterface,
  Where,
} from '@concepta/nestjs-repository';

import { User } from '../../domain/aggregates/user';
import { UserRepositoryInterface } from '../../domain/repositories/user-repository.interface';

import { UserMapper } from './user.mapper';

export class UserRepository implements UserRepositoryInterface {
  constructor(
    protected readonly repository: RepositoryInterface<UserEntityInterface>,
    private readonly mapper: UserMapper,
  ) {}

  async get(
    ctx: RepositoryContextInterface,
    id: ReferenceId,
  ): Promise<User | null> {
    const w = Where.for<UserEntityInterface>();

    const entity = await this.repository.findOne({
      where: w.eq('id', id),
      ctx,
    });

    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByEmail(
    ctx: RepositoryContextInterface,
    email: ReferenceEmail,
  ): Promise<User | null> {
    const w = Where.for<UserEntityInterface>();

    const entity = await this.repository.findOne({
      where: w.eq('email', email),
      ctx,
    });

    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByUsername(
    ctx: RepositoryContextInterface,
    username: ReferenceUsername,
  ): Promise<User | null> {
    const w = Where.for<UserEntityInterface>();

    const entity = await this.repository.findOne({
      where: w.eq('username', username),
      ctx,
    });

    return entity ? this.mapper.toDomain(entity) : null;
  }

  async save(ctx: RepositoryContextInterface, user: User): Promise<void> {
    user.stampUpdated();
    await this.repository.upsert(this.mapper.toPersistence(user), { ctx });
  }

  async remove(ctx: RepositoryContextInterface, user: User): Promise<void> {
    await this.repository.delete(this.mapper.toPersistence(user), { ctx });
  }
}
