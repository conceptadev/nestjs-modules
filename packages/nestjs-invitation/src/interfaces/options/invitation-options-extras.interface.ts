import { type DynamicModule, type Type } from '@nestjs/common';

import { type InvitationRepositoryInterface } from '../../domain/repositories/invitation-repository.interface';

export interface InvitationOptionsExtrasInterface extends Pick<
  DynamicModule,
  'global'
> {
  entities?: {
    invitation?: string;
  };
  repositories?: {
    invitation?: Type<InvitationRepositoryInterface>;
  };
}
