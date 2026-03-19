import { OtpInterface } from '@concepta/nestjs-common';
import { RepositoryContextInterface } from '@concepta/nestjs-repository';

export class FindActiveOtpQuery {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly otp: Pick<OtpInterface, 'category' | 'passcode'>,
  ) {}
}
