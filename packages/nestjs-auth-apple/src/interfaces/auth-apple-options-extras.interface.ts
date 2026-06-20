import { DynamicModule } from '@nestjs/common';

export interface AuthAppleOptionsExtrasInterface extends Pick<
  DynamicModule,
  'global'
> {}
