import {
  ReferenceId,
  RepositoryContextInterface,
} from '@concepta/nestjs-common';

import { UserCredentials } from '../aggregates/user-credentials';

export interface UserCredentialsRepositoryInterface {
  findActiveByUserId(
    ctx: RepositoryContextInterface,
    userId: ReferenceId,
  ): Promise<UserCredentials | null>;

  findByUserId(
    ctx: RepositoryContextInterface,
    userId: ReferenceId,
    limitDate?: Date,
  ): Promise<UserCredentials[]>;

  save(ctx: RepositoryContextInterface, entry: UserCredentials): Promise<void>;
}
