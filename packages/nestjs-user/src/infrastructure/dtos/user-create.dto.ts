import { Exclude } from 'class-transformer';

import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';

import { UserCreatableInterface } from '@concepta/nestjs-common';

import { UserPasswordHashDto } from './password/user-password-hash.dto';
import { UserDto } from './user.dto';

@Exclude()
export class UserCreateDto
  extends IntersectionType(
    PickType(UserDto, ['username', 'email'] as const),
    PartialType(PickType(UserDto, ['active'] as const)),
    PartialType(UserPasswordHashDto),
  )
  implements UserCreatableInterface {}
