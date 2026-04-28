import { PlainLiteralObject } from '@nestjs/common';
import { Query } from '@nestjs/cqrs';

import { Otp } from '../../../domain/aggregates/otp';
import { OtpInterface } from '../../../domain/interfaces/otp.interface';

export class FindActiveOtpQuery extends Query<Otp | null> {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly namespace: string,
    public readonly otp: Pick<OtpInterface, 'category' | 'passcode'>,
  ) {
    super();
  }
}
