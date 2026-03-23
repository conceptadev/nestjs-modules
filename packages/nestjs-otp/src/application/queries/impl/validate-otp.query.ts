import { OtpInterface } from '@concepta/nestjs-common';
import { RepositoryContextInterface } from '@concepta/nestjs-repository';

export class ValidateOtpQuery {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly namespace: string,
    public readonly otp: Pick<OtpInterface, 'category' | 'passcode'>,
  ) {}
}
