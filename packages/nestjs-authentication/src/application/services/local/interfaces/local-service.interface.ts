import { PlainLiteralObject } from '@nestjs/common';

import { ReferenceIdInterface } from '@concepta/nestjs-common';

import { LocalValidateUserInterface } from './local-validate-user.interface';

export interface LocalServiceInterface {
  validateUser(
    ctx: PlainLiteralObject,
    dto: LocalValidateUserInterface,
  ): Promise<ReferenceIdInterface>;
}
