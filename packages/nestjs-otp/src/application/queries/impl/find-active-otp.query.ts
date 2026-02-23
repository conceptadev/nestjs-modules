import {
  OtpInterface,
  RepositoryContextInterface,
} from '@concepta/nestjs-common';

export class FindActiveOtpQuery {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly otp: Pick<OtpInterface, 'category' | 'passcode'>,
  ) {}
}
