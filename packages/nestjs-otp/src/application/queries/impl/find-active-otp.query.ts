import { type PlainLiteralObject } from '@nestjs/common';
import { Query } from '@nestjs/cqrs';

import { type Otp } from '../../../domain/aggregates/otp';
import { type OtpInterface } from '../../../domain/interfaces/otp.interface';

export class FindActiveOtpQuery extends Query<Otp | null> {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly namespace: string,
    public readonly otp: Pick<OtpInterface, 'category' | 'passcode'>,
  ) {
    super();
  }
}
