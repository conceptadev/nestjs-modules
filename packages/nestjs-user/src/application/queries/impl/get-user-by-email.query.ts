import {
  ReferenceEmail,
  RepositoryContextInterface,
} from '@concepta/nestjs-common';

export class GetUserByEmailQuery {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly email: ReferenceEmail,
  ) {}
}
