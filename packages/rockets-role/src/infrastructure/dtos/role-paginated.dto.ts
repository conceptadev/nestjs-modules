import { Exclude, Expose, Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

import { CrudResponsePaginatedDto } from '@concepta/rockets-crud';

import { RoleDto } from './role.dto';

@Exclude()
export class RolePaginatedDto extends CrudResponsePaginatedDto<RoleDto> {
  @Expose()
  @ApiProperty({
    type: RoleDto,
    isArray: true,
    description: 'Array of Roles',
  })
  @Type(() => RoleDto)
  data: RoleDto[] = [];
}
