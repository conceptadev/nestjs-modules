import { PlainLiteralObject } from '@nestjs/common';

export interface RoleSettingsInterface {
  assignments: PlainLiteralObject & { entityKey: string };
}
