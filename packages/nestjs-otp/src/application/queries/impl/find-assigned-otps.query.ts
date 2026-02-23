import {
  OtpInterface,
  RepositoryContextInterface,
} from '@concepta/nestjs-common';

export class FindAssignedOtpsQuery {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly otp: Pick<OtpInterface, 'assigneeId' | 'category'>,
  ) {}
}
