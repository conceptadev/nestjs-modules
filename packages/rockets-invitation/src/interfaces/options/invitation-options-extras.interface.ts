import { DynamicModule, Type } from '@nestjs/common';

import { InvitationRepositoryInterface } from '../../domain/repositories/invitation-repository.interface';

export interface InvitationOptionsExtrasInterface
  extends Pick<DynamicModule, 'global'> {
  entities?: {
    invitation?: string;
  };
  repositories?: {
    invitation?: Type<InvitationRepositoryInterface>;
  };
}
