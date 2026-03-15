import {
  ReferenceEmail,
  ReferenceId,
  ReferenceUsername,
  RepositoryContextInterface,
  RepositoryInterface,
  UserEntityInterface,
  Where,
} from '@concepta/nestjs-common';

import { User } from '../../domain/aggregates/user';
import { UserRepositoryInterface } from '../../domain/repositories/user-repository.interface';

export class UserRepository implements UserRepositoryInterface {
  constructor(
    protected readonly repository: RepositoryInterface<UserEntityInterface>,
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

    return entity ? User.toInstance(entity) : null;
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

    return entity ? User.toInstance(entity) : null;
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

    return entity ? User.toInstance(entity) : null;
  }

  async save(ctx: RepositoryContextInterface, user: User): Promise<void> {
    const entity = await this.repository.upsert(user.toPlain(), { ctx });
    user.hydrate(entity);
  }

  async remove(ctx: RepositoryContextInterface, user: User): Promise<void> {
    await this.repository.delete(user.toPlain(), { ctx });
  }
}
