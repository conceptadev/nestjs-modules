import { PlainLiteralObject } from '@nestjs/common';

import { RepositoryInterface, Where } from '@concepta/nestjs-repository';
import {
  ReferenceEmail,
  ReferenceId,
  ReferenceUsername,
} from '@concepta/rockets-app';

import { User } from '../../domain/aggregates/user';
import { UserEntityInterface } from '../../domain/interfaces/user-entity.interface';
import { UserRepositoryInterface } from '../../domain/repositories/user-repository.interface';

import { UserMapper } from './user.mapper';

export class UserRepository implements UserRepositoryInterface {
  constructor(
    protected readonly repository: RepositoryInterface<UserEntityInterface>,
    private readonly mapper: UserMapper,
  ) {}

  async get(ctx: PlainLiteralObject, id: ReferenceId): Promise<User | null> {
    const w = Where.for<UserEntityInterface>();

    const entity = await this.repository.findOne({
      where: w.eq('id', id),
      ctx,
    });

    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByEmail(
    ctx: PlainLiteralObject,
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
    ctx: PlainLiteralObject,
    username: ReferenceUsername,
  ): Promise<User | null> {
    const w = Where.for<UserEntityInterface>();

    const entity = await this.repository.findOne({
      where: w.eq('username', username),
      ctx,
    });

    return entity ? this.mapper.toDomain(entity) : null;
  }

  async save(ctx: PlainLiteralObject, user: User): Promise<void> {
    user.stampUpdated();
    await this.repository.upsert(this.mapper.toPersistence(user), { ctx });
  }

  async remove(ctx: PlainLiteralObject, user: User): Promise<void> {
    await this.repository.delete(this.mapper.toPersistence(user), { ctx });
  }
}
