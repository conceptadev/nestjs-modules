import { Command } from '@nestjs/cqrs';

import { ReferenceId } from '@concepta/nestjs-common';
import { RepositoryContextInterface } from '@concepta/nestjs-repository';

import { Invitation } from '../../../domain/aggregates/invitation';

export class RemoveInvitationCommand extends Command<Invitation> {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly id: ReferenceId,
  ) {
    super();
  }
}
