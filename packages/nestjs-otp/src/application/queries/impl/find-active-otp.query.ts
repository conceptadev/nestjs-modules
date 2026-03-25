import { PlainLiteralObject } from '@nestjs/common';

import { OtpInterface } from '@concepta/nestjs-common';

export class FindActiveOtpQuery {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly namespace: string,
    public readonly otp: Pick<OtpInterface, 'category' | 'passcode'>,
  ) {}
}
