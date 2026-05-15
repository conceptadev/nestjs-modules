import { PlainLiteralObject } from '@nestjs/common';

import { ReferenceId } from '@concepta/rockets-app';

import { Invitation } from '../aggregates/invitation';

export interface InvitationRepositoryInterface {
  get(ctx: PlainLiteralObject, id: ReferenceId): Promise<Invitation | null>;

  findOneByCode(
    ctx: PlainLiteralObject,
    code: string,
  ): Promise<Invitation | null>;

  findAllByUserAndCategory(
    ctx: PlainLiteralObject,
    userId: ReferenceId,
    category: string,
  ): Promise<Invitation[]>;

  save(ctx: PlainLiteralObject, invitation: Invitation): Promise<void>;

  remove(ctx: PlainLiteralObject, invitation: Invitation): Promise<void>;
}
