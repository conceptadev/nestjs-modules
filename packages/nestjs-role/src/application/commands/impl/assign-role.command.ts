import { RepositoryContextInterface } from '@concepta/nestjs-common';

export class AssignRoleCommand {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly roleId: string,
    public readonly assigneeId: string,
  ) {}
}
