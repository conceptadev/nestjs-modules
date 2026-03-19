import { ReferenceUsername } from '@concepta/nestjs-common';
import { RepositoryContextInterface } from '@concepta/nestjs-repository';

export class GetUserByUsernameQuery {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly username: ReferenceUsername,
  ) {}
}
