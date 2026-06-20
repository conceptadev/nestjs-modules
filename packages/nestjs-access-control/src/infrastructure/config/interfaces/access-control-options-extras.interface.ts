import { DynamicModule, Provider } from '@nestjs/common';

import { CanAccess } from '../../../domain/policies/can-access.policy';

export interface AccessControlOptionsExtrasInterface extends Pick<
  DynamicModule,
  'global' | 'imports'
> {
  queryServices?: Provider<CanAccess>[];
}
