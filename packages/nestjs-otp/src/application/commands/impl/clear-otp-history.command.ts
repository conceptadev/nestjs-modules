import { OtpInterface } from '@concepta/nestjs-common';
import { RepositoryContextInterface } from '@concepta/nestjs-repository';

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
