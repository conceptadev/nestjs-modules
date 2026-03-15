import {
  ReferenceEmail,
  ReferenceId,
  ReferenceUsername,
  RepositoryContextInterface,
} from '@concepta/nestjs-common';

import { User } from '../aggregates/user';

export interface UserRepositoryInterface {
  get(ctx: RepositoryContextInterface, id: ReferenceId): Promise<User | null>;

  findByEmail(
    ctx: RepositoryContextInterface,
    email: ReferenceEmail,
  ): Promise<User | null>;

  findByUsername(
    ctx: RepositoryContextInterface,
    username: ReferenceUsername,
  ): Promise<User | null>;

  save(ctx: RepositoryContextInterface, user: User): Promise<void>;

  remove(ctx: RepositoryContextInterface, user: User): Promise<void>;
}
