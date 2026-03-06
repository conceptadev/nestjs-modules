import { Exclude } from 'class-transformer';

import { PickType } from '@nestjs/swagger';

import { RoleCreatableInterface } from '@concepta/nestjs-common';

import { RoleDto } from './role.dto';

/**
 * Role Create DTO
 */
@Exclude()
export class RoleCreateDto
  extends PickType(RoleDto, ['name', 'description'] as const)
  implements RoleCreatableInterface {}
