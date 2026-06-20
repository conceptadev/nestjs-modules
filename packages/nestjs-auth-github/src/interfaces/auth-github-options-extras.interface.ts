import { DynamicModule } from '@nestjs/common';

export interface AuthGithubOptionsExtrasInterface extends Pick<
  DynamicModule,
  'global'
> {}
