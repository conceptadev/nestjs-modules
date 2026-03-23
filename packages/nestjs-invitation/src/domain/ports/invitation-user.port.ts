import { Injectable, Type } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import {
  ReferenceEmail,
  ReferenceId,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';
import { RepositoryContextInterface } from '@concepta/nestjs-repository';

import { InvitationUserInterface } from '../interfaces/invitation-user.interface';

export type InvitationUserResult =
  | (ReferenceIdInterface & InvitationUserInterface)
  | null;

export interface GetUserByIdQueryInterface {
  ctx: RepositoryContextInterface;
  id: ReferenceId;
}

export interface GetUserByEmailQueryInterface {
  ctx: RepositoryContextInterface;
  email: ReferenceEmail;
}

export interface InvitationUserPortSettings {
  getByIdQuery: Type<GetUserByIdQueryInterface>;
  getByEmailQuery: Type<GetUserByEmailQueryInterface>;
}

@Injectable()
export class InvitationUserPort {
  constructor(
    private readonly portSettings: InvitationUserPortSettings,
    private readonly queryBus: QueryBus,
  ) {}

  async getById(
    ctx: RepositoryContextInterface,
    userId: ReferenceId,
  ): Promise<InvitationUserResult> {
    return this.queryBus.execute(
      new this.portSettings.getByIdQuery(ctx, userId),
    );
  }

  async getByEmail(
    ctx: RepositoryContextInterface,
    email: ReferenceEmail,
  ): Promise<InvitationUserResult> {
    return this.queryBus.execute(
      new this.portSettings.getByEmailQuery(ctx, email),
    );
  }
}
