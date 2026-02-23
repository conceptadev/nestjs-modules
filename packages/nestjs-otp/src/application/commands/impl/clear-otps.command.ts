import {
  OtpInterface,
  RepositoryContextInterface,
} from '@concepta/nestjs-common';

export class ClearOtpsCommand {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly otp: Pick<OtpInterface, 'assigneeId' | 'category'>,
  ) {}
}
