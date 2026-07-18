import { Exclude } from 'class-transformer';

import { PickType } from '@nestjs/swagger';

import { RoleUpdatableInterface } from '../../domain/interfaces/role-updatable.interface.js';

import { RoleDto } from './role.dto.js';

/**
 * Role Update DTO
 */
@Exclude()
export class RoleUpdateDto
  extends PickType(RoleDto, ['name', 'description'] as const)
  implements Pick<RoleUpdatableInterface, 'name' | 'description'> {}
