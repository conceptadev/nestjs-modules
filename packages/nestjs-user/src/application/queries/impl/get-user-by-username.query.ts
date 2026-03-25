import { PlainLiteralObject } from '@nestjs/common';

import { ReferenceUsername } from '@concepta/nestjs-common';

export class GetUserByUsernameQuery {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly username: ReferenceUsername,
  ) {}
}
