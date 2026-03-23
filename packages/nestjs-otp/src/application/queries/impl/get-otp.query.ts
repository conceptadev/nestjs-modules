import { ReferenceId } from '@concepta/nestjs-common';
import { RepositoryContextInterface } from '@concepta/nestjs-repository';

export class GetOtpQuery {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly namespace: string,
    public readonly id: ReferenceId,
  ) {}
}
