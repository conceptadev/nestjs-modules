import { Provider, Type } from '@nestjs/common';

import {
  getDynamicRepositoryToken,
  RepositoryInterface,
} from '@concepta/rockets-repository';

import { InvitationRepositoryInterface } from '../../domain/repositories/invitation-repository.interface';
import { INVITATION_MODULE_REPOSITORY_TOKEN } from '../../invitation.constants';
import { InvitationEntityInterface } from '../persistence/interfaces/invitation-entity.interface';
import { InvitationMapper } from '../persistence/invitation.mapper';
import { InvitationRepository } from '../persistence/invitation.repository';

export function createInvitationRepositoryProvider(
  entityKey: string,
  customRepository?: Type<InvitationRepositoryInterface>,
): Provider[] {
  if (customRepository) {
    return [
      {
        provide: INVITATION_MODULE_REPOSITORY_TOKEN,
        useClass: customRepository,
      },
    ];
  }

  return [
    {
      provide: INVITATION_MODULE_REPOSITORY_TOKEN,
      inject: [getDynamicRepositoryToken(entityKey), InvitationMapper],
      useFactory: (
        repository: RepositoryInterface<InvitationEntityInterface>,
        mapper: InvitationMapper,
      ) => new InvitationRepository(repository, mapper),
    },
  ];
}
