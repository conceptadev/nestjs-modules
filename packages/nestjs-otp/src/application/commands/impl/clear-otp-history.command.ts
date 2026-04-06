import { PlainLiteralObject } from '@nestjs/common';

import { OtpInterface } from '../../../domain/interfaces/otp.interface';

interface ClearOtpHistoryCommandOptions {
  keepHistoryDays?: number;
}

export class ClearOtpHistoryCommand {
  public readonly keepHistoryDays?: number;

  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly namespace: string,
    public readonly otp: Pick<OtpInterface, 'assigneeId' | 'category'>,
    options?: ClearOtpHistoryCommandOptions,
  ) {
    this.keepHistoryDays = options?.keepHistoryDays;
  }
}
