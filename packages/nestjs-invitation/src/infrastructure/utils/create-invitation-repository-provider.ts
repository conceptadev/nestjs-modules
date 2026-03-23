import { Provider } from '@nestjs/common';

import {
  getDynamicRepositoryToken,
  RepositoryInterface,
} from '@concepta/nestjs-repository';

import { INVITATION_MODULE_REPOSITORY_TOKEN } from '../../invitation.constants';
import { InvitationEntityInterface } from '../persistence/interfaces/invitation-entity.interface';
import { InvitationMapper } from '../persistence/invitation.mapper';
import { InvitationRepository } from '../persistence/invitation.repository';

export function createInvitationRepositoryProvider(
  entityKey: string,
): Provider {
  return {
    provide: INVITATION_MODULE_REPOSITORY_TOKEN,
    inject: [getDynamicRepositoryToken(entityKey), InvitationMapper],
    useFactory: (
      repository: RepositoryInterface<InvitationEntityInterface>,
      mapper: InvitationMapper,
    ) => new InvitationRepository(repository, mapper),
  };
}
