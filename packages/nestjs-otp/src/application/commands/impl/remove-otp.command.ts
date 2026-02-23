import {
  OtpInterface,
  RepositoryContextInterface,
} from '@concepta/nestjs-common';

export class RemoveOtpCommand {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly otp: Pick<
      OtpInterface,
      'assigneeId' | 'category' | 'passcode'
    >,
  ) {}
}
