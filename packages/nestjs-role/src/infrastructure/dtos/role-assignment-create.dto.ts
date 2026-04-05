import { Exclude } from 'class-transformer';

import { PickType } from '@nestjs/swagger';

import { RoleAssignmentCreatableInterface } from '../../domain/interfaces/role-assignment-creatable.interface';

import { RoleAssignmentDto } from './role-assignment.dto';

/**
 * Role Assignment Create DTO
 */
@Exclude()
export class RoleAssignmentCreateDto
  extends PickType(RoleAssignmentDto, ['roleId', 'assigneeId'] as const)
  implements RoleAssignmentCreatableInterface {}
