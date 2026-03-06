import { LiteralObject } from '@concepta/nestjs-common';

export interface RoleSettingsInterface {
  assignments: LiteralObject<{ entityKey: string }>;
}
