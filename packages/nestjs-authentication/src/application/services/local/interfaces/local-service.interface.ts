import { PlainLiteralObject } from '@nestjs/common';

import { ReferenceIdInterface } from '@concepta/nestjs-core';

import { LocalValidateUserInterface } from './local-validate-user.interface';

export interface LocalServiceInterface {
  validateUser(
    ctx: PlainLiteralObject,
    dto: LocalValidateUserInterface,
  ): Promise<ReferenceIdInterface>;
}
