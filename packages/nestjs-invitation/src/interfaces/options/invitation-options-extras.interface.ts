import { DynamicModule } from '@nestjs/common';

export interface InvitationOptionsExtrasInterface
  extends Pick<DynamicModule, 'global'> {
  entities?: {
    invitation?: string;
  };
}
