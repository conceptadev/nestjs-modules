import { Exclude } from 'class-transformer';

import { PickType } from '@nestjs/swagger';

import { RoleAssignmentCreatableInterface } from '@concepta/nestjs-common';

import { RoleAssignmentDto } from './role-assignment.dto';

/**
 * Role Assignment Create DTO
 */
@Exclude()
export class RoleAssignmentCreateDto
  extends PickType(RoleAssignmentDto, ['roleId', 'assigneeId'] as const)
  implements RoleAssignmentCreatableInterface {}
