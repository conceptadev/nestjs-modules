import { Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

import { CrudResponsePaginatedDto } from '../../../../infrastructure/dtos/crud-response-paginated.dto';

import { UserDto } from './user.dto';

export class UserPaginatedDto extends CrudResponsePaginatedDto<UserDto> {
  @ApiProperty({
    type: UserDto,
    isArray: true,
  })
  @Type(() => UserDto)
  data!: UserDto[];
}
