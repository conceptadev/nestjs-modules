import { RepositoryContextInterface } from '@concepta/nestjs-repository';

export class RevokeRoleCommand {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly roleId: string,
    public readonly assigneeId: string,
  ) {}
}
