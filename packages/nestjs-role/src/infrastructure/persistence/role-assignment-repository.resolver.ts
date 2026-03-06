import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { RoleEntityNotFoundException } from '../exceptions/role-entity-not-found.exception';
import { getDynamicRoleAssignmentRepositoryToken } from '../utils/create-role-assignment-repository-provider';

import { RoleAssignmentRepository } from './role-assignment.repository';

@Injectable()
export class RoleAssignmentRepositoryResolver {
  constructor(private readonly moduleRef: ModuleRef) {}

  resolve(entityKey: string): RoleAssignmentRepository {
    const token = getDynamicRoleAssignmentRepositoryToken(entityKey);

    try {
      return this.moduleRef.get<RoleAssignmentRepository>(token, {
        strict: false,
      });
    } catch {
      throw new RoleEntityNotFoundException(entityKey);
    }
  }
}
