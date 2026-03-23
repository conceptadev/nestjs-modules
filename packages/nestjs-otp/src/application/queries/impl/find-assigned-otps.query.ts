import { OtpInterface } from '@concepta/nestjs-common';
import { RepositoryContextInterface } from '@concepta/nestjs-repository';

export class FindAssignedOtpsQuery {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly namespace: string,
    public readonly otp: Pick<OtpInterface, 'assigneeId' | 'category'>,
  ) {}
}
