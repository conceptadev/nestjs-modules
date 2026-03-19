import { ReferenceSubject } from '@concepta/nestjs-common';
import { RepositoryContextInterface } from '@concepta/nestjs-repository';

export class GetUserBySubjectQuery {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly subject: ReferenceSubject,
  ) {}
}
