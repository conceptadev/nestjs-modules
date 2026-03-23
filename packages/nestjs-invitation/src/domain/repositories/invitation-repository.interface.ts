import { ReferenceId } from '@concepta/nestjs-common';
import { RepositoryContextInterface } from '@concepta/nestjs-repository';

import { Invitation } from '../aggregates/invitation';

export interface InvitationRepositoryInterface {
  get(
    ctx: RepositoryContextInterface,
    id: ReferenceId,
  ): Promise<Invitation | null>;

  findOneByCode(
    ctx: RepositoryContextInterface,
    code: string,
  ): Promise<Invitation | null>;

  findAllByUserAndCategory(
    ctx: RepositoryContextInterface,
    userId: ReferenceId,
    category: string,
  ): Promise<Invitation[]>;

  save(ctx: RepositoryContextInterface, invitation: Invitation): Promise<void>;

  remove(
    ctx: RepositoryContextInterface,
    invitation: Invitation,
  ): Promise<void>;

  removeAll(
    ctx: RepositoryContextInterface,
    invitations: Invitation[],
  ): Promise<void>;
}
