import { ReferenceEmail } from '@concepta/nestjs-common';
import { RepositoryContextInterface } from '@concepta/nestjs-repository';

export class GetUserByEmailQuery {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly email: ReferenceEmail,
  ) {}
}
