import { Exclude } from 'class-transformer';

import { PickType } from '@nestjs/swagger';

import { RoleUpdatableInterface } from '@concepta/nestjs-common';

import { RoleDto } from './role.dto';

/**
 * Role Update DTO
 */
@Exclude()
export class RoleUpdateDto
  extends PickType(RoleDto, ['name', 'description'] as const)
  implements Pick<RoleUpdatableInterface, 'name' | 'description'> {}
