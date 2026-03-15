import { Exclude } from 'class-transformer';

import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';

import { UserUpdatableInterface } from '@concepta/nestjs-common';

import { UserDto } from './user.dto';

@Exclude()
export class UserUpdateDto
  extends IntersectionType(
    PickType(UserDto, ['id'] as const),
    PartialType(PickType(UserDto, ['email', 'active'] as const)),
  )
  implements UserUpdatableInterface {}
