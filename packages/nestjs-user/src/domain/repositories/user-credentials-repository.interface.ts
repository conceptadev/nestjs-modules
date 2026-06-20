import { PlainLiteralObject } from '@nestjs/common';

import { ReferenceId } from '@concepta/nestjs-core';

import { UserCredentials } from '../aggregates/user-credentials';

export interface UserCredentialsRepositoryInterface {
  findActiveByUserId(
    ctx: PlainLiteralObject,
    userId: ReferenceId,
  ): Promise<UserCredentials | null>;

  findByUserId(
    ctx: PlainLiteralObject,
    userId: ReferenceId,
    limitDate?: Date,
  ): Promise<UserCredentials[]>;

  save(ctx: PlainLiteralObject, entry: UserCredentials): Promise<void>;
}
