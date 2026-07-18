import { Exclude } from 'class-transformer';

import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';

import { UserCreatableInterface } from '../../domain/interfaces/user-creatable.interface.js';

import { UserPasswordHashDto } from './password/user-password-hash.dto.js';
import { UserDto } from './user.dto.js';

@Exclude()
export class UserCreateDto
  extends IntersectionType(
    PickType(UserDto, ['username', 'email'] as const),
    PartialType(PickType(UserDto, ['active'] as const)),
    PartialType(UserPasswordHashDto),
  )
  implements UserCreatableInterface {}
