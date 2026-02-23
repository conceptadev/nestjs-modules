import {
  ReferenceId,
  RepositoryContextInterface,
} from '@concepta/nestjs-common';

export class GetOtpQuery {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly id: ReferenceId,
  ) {}
}
