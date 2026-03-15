import {
  ReferenceSubject,
  RepositoryContextInterface,
} from '@concepta/nestjs-common';

export class GetUserBySubjectQuery {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly subject: ReferenceSubject,
  ) {}
}
