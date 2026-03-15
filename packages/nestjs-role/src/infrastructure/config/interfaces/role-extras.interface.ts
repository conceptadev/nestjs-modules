import { DynamicModule, Type } from '@nestjs/common';

import { RoleAssignmentRepositoryInterface } from '../../../domain/repositories/role-assignment-repository.interface';
import { RoleRepositoryInterface } from '../../../domain/repositories/role-repository.interface';

export interface RoleExtrasInterface extends Pick<DynamicModule, 'global'> {
  repositories?: {
    role?: Type<RoleRepositoryInterface>;
    roleAssignment?: Type<RoleAssignmentRepositoryInterface>;
  };
}
