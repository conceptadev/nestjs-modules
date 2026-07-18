import { Exclude } from 'class-transformer';

import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';

import { UserUpdatableInterface } from '../../domain/interfaces/user-updatable.interface.js';

import { UserDto } from './user.dto.js';

@Exclude()
export class UserUpdateDto
  extends IntersectionType(
    PickType(UserDto, ['id'] as const),
    PartialType(PickType(UserDto, ['email', 'active'] as const)),
  )
  implements UserUpdatableInterface {}
