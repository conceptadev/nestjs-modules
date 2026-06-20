import { DynamicModule } from '@nestjs/common';

export interface LoggerOptionsExtrasInterface extends Pick<
  DynamicModule,
  'global'
> {}
