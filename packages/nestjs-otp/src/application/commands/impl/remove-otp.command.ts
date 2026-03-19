import { OtpInterface } from '@concepta/nestjs-common';
import { RepositoryContextInterface } from '@concepta/nestjs-repository';

export class RemoveOtpCommand {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly otp: Pick<
      OtpInterface,
      'assigneeId' | 'category' | 'passcode'
    >,
  ) {}
}
