import { Exclude, Expose, Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

import { CrudResponsePaginatedDto } from '@concepta/nestjs-crud';

import { UserDto } from './user.dto.js';

@Exclude()
export class UserPaginatedDto extends CrudResponsePaginatedDto<UserDto> {
  @Expose()
  @ApiProperty({
    type: UserDto,
    isArray: true,
    description: 'Array of Users',
  })
  @Type(() => UserDto)
  data: UserDto[] = [];
}
