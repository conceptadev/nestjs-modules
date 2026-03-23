import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { Invitation } from '../../../domain/aggregates/invitation';
import { InvitationRepositoryInterface } from '../../../domain/repositories/invitation-repository.interface';
import { INVITATION_MODULE_REPOSITORY_TOKEN } from '../../../invitation.constants';
import { GetInvitationQuery } from '../impl/get-invitation.query';

@QueryHandler(GetInvitationQuery)
export class GetInvitationHandler implements IQueryHandler<GetInvitationQuery> {
  constructor(
    @Inject(INVITATION_MODULE_REPOSITORY_TOKEN)
    private readonly invitationRepo: InvitationRepositoryInterface,
  ) {}

  async execute(query: GetInvitationQuery): Promise<Invitation | null> {
    const { ctx, id } = query;

    return this.invitationRepo.get(ctx, id);
  }
}
