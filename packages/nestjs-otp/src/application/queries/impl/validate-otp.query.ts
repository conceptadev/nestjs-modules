import { PlainLiteralObject } from '@nestjs/common';

import { OtpInterface } from '../../../domain/interfaces/otp.interface';

export class ValidateOtpQuery {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly namespace: string,
    public readonly otp: Pick<OtpInterface, 'category' | 'passcode'>,
  ) {}
}
