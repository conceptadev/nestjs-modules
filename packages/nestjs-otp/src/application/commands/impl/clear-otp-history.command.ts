import {
  OtpInterface,
  RepositoryContextInterface,
} from '@concepta/nestjs-common';

interface ClearOtpHistoryCommandOptions {
  keepHistoryDays?: number;
}

export class ClearOtpHistoryCommand {
  public readonly keepHistoryDays?: number;

  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly otp: Pick<OtpInterface, 'assigneeId' | 'category'>,
    options?: ClearOtpHistoryCommandOptions,
  ) {
    this.keepHistoryDays = options?.keepHistoryDays;
  }
}
