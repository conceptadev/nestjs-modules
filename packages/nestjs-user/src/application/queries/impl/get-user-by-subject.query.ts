import { PlainLiteralObject } from '@nestjs/common';

import { ReferenceSubject } from '@concepta/nestjs-common';

export class GetUserBySubjectQuery {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly subject: ReferenceSubject,
  ) {}
}
