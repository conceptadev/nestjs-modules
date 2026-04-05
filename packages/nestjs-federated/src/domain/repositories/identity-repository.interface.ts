import { PlainLiteralObject } from '@nestjs/common';

import { ReferenceId } from '@concepta/nestjs-common';

import { Identity } from '../aggregates/identity';

export interface IdentityRepositoryInterface {
  get(ctx: PlainLiteralObject, id: ReferenceId): Promise<Identity | null>;

  findByProviderAndSubject(
    ctx: PlainLiteralObject,
    provider: string,
    subject: string,
  ): Promise<Identity | null>;

  save(ctx: PlainLiteralObject, identity: Identity): Promise<void>;

  remove(ctx: PlainLiteralObject, identity: Identity): Promise<void>;
}
