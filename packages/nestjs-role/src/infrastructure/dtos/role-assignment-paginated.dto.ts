import { Exclude, Expose, Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

import { RoleAssignmentInterface } from '@concepta/nestjs-common';
import { CrudResponsePaginatedDto } from '@concepta/nestjs-crud';

import { RoleAssignmentDto } from './role-assignment.dto';

/**
 * Role Assignment Paginated DTO
 */
@Exclude()
export class RoleAssignmentPaginatedDto extends CrudResponsePaginatedDto<RoleAssignmentInterface> {
  @Expose()
  @ApiProperty({
    type: RoleAssignmentDto,
    isArray: true,
    description: 'Array of Role Assignments',
  })
  @Type(() => RoleAssignmentDto)
  data: RoleAssignmentInterface[] = [];
}
