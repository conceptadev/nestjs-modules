import { Exclude } from 'class-transformer';

import { PickType } from '@nestjs/swagger';

import { RoleUpdatableInterface } from '../../domain/interfaces/role-updatable.interface';

import { RoleDto } from './role.dto';

/**
 * Role Update DTO
 */
@Exclude()
export class RoleUpdateDto
  extends PickType(RoleDto, ['name', 'description'] as const)
  implements Pick<RoleUpdatableInterface, 'name' | 'description'> {}
