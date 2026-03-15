import {
  ReferenceUsername,
  RepositoryContextInterface,
} from '@concepta/nestjs-common';

export class GetUserByUsernameQuery {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly username: ReferenceUsername,
  ) {}
}
