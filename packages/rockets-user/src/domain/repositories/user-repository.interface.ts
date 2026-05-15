import { PlainLiteralObject } from '@nestjs/common';

import {
  ReferenceEmail,
  ReferenceId,
  ReferenceUsername,
} from '@concepta/rockets-app';

import { User } from '../aggregates/user';

export interface UserRepositoryInterface {
  get(ctx: PlainLiteralObject, id: ReferenceId): Promise<User | null>;

  findByEmail(
    ctx: PlainLiteralObject,
    email: ReferenceEmail,
  ): Promise<User | null>;

  findByUsername(
    ctx: PlainLiteralObject,
    username: ReferenceUsername,
  ): Promise<User | null>;

  save(ctx: PlainLiteralObject, user: User): Promise<void>;

  remove(ctx: PlainLiteralObject, user: User): Promise<void>;
}
