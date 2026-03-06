import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import {
  RoleAssignmentInterface,
  CommonEntityDto,
  ReferenceId,
} from '@concepta/nestjs-common';

/**
 * Role assignment DTO
 */
@Exclude()
export class RoleAssignmentDto
  extends CommonEntityDto
  implements RoleAssignmentInterface
{
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Role ID',
  })
  @IsString()
  @IsNotEmpty()
  roleId!: ReferenceId;

  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Assignee ID',
  })
  @IsString()
  @IsNotEmpty()
  assigneeId!: ReferenceId;
}
