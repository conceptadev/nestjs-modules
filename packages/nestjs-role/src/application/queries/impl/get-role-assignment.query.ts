import { PlainLiteralObject } from '@nestjs/common';
import { Query } from '@nestjs/cqrs';

import { ReferenceId } from '@concepta/nestjs-core';

import { RoleAssignment } from '../../../domain/aggregates/role-assignment';

export class GetRoleAssignmentQuery extends Query<RoleAssignment> {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly namespace: string,
    public readonly id: ReferenceId,
  ) {
    super();
  }
}
