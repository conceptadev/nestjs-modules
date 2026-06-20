import { Exclude } from 'class-transformer';

import { PickType } from '@nestjs/swagger';

import { RoleCreatableInterface } from '../../domain/interfaces/role-creatable.interface';

import { RoleDto } from './role.dto';

/**
 * Role Create DTO
 */
@Exclude()
export class RoleCreateDto
  extends PickType(RoleDto, ['name', 'description'] as const)
  implements RoleCreatableInterface {}
