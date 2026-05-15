import { Exclude, Expose, Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

import { CrudResponsePaginatedDto } from '@concepta/rockets-crud';

import { RoleAssignmentDto } from './role-assignment.dto';

@Exclude()
export class RoleAssignmentPaginatedDto extends CrudResponsePaginatedDto<RoleAssignmentDto> {
  @Expose()
  @ApiProperty({
    type: RoleAssignmentDto,
    isArray: true,
    description: 'Array of Role Assignments',
  })
  @Type(() => RoleAssignmentDto)
  data: RoleAssignmentDto[] = [];
}
