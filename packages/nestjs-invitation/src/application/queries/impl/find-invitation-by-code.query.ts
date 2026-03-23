import { Query } from '@nestjs/cqrs';

import { RepositoryContextInterface } from '@concepta/nestjs-repository';

import { Invitation } from '../../../domain/aggregates/invitation';

export class FindInvitationByCodeQuery extends Query<Invitation | null> {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly code: string,
  ) {
    super();
  }
}
