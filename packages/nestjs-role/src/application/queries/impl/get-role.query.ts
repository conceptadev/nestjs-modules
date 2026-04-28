import { PlainLiteralObject } from '@nestjs/common';
import { Query } from '@nestjs/cqrs';

import { ReferenceId } from '@concepta/nestjs-common';

import { Role } from '../../../domain/aggregates/role';

export class GetRoleQuery extends Query<Role> {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly namespace: string,
    public readonly id: ReferenceId,
  ) {
    super();
  }
}
