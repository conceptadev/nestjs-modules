import { Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

import { CrudResponsePaginatedDto } from '../../../../infrastructure/dtos/crud-response-paginated.dto';

import { UserProfileDto } from './user-profile.dto';

export class UserProfilePaginatedDto extends CrudResponsePaginatedDto<UserProfileDto> {
  @ApiProperty({
    type: UserProfileDto,
    isArray: true,
  })
  @Type(() => UserProfileDto)
  data!: UserProfileDto[];
}
