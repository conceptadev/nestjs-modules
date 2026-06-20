import { PlainLiteralObject } from '@nestjs/common';
import { Command } from '@nestjs/cqrs';

import { OtpInterface } from '../../../domain/interfaces/otp.interface';

export class RemoveOtpCommand extends Command<void> {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly namespace: string,
    public readonly otp: Pick<
      OtpInterface,
      'assigneeId' | 'category' | 'passcode'
    >,
  ) {
    super();
  }
}
