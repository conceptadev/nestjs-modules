import { Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

import { CrudResponsePaginatedDto } from '../../../../infrastructure/dtos/crud-response-paginated.dto.js';

import { UserProfileDto } from './user-profile.dto.js';

export class UserProfilePaginatedDto extends CrudResponsePaginatedDto<UserProfileDto> {
  @ApiProperty({
    type: UserProfileDto,
    isArray: true,
  })
  @Type(() => UserProfileDto)
  data!: UserProfileDto[];
}
