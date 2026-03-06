import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { RoleEntityNotFoundException } from '../exceptions/role-entity-not-found.exception';
import { getDynamicRoleRepositoryToken } from '../utils/create-role-repository-provider';

import { RoleRepository } from './role.repository';

@Injectable()
export class RoleRepositoryResolver {
  constructor(private readonly moduleRef: ModuleRef) {}

  resolve(entityKey: string): RoleRepository {
    const token = getDynamicRoleRepositoryToken(entityKey);

    try {
      return this.moduleRef.get<RoleRepository>(token, { strict: false });
    } catch {
      throw new RoleEntityNotFoundException(entityKey);
    }
  }
}
