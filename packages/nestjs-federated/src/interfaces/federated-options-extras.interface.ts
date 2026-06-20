import { DynamicModule, Type } from '@nestjs/common';

import { IdentityRepositoryInterface } from '../domain/repositories/identity-repository.interface';

export interface FederatedOptionsExtrasInterface extends Pick<
  DynamicModule,
  'global'
> {
  entities?: {
    identity?: string;
  };
  repositories?: {
    identity?: Type<IdentityRepositoryInterface>;
  };
}
