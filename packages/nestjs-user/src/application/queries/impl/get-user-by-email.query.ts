import { PlainLiteralObject } from '@nestjs/common';

import { ReferenceEmail } from '@concepta/nestjs-common';

export class GetUserByEmailQuery {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly email: ReferenceEmail,
  ) {}
}
