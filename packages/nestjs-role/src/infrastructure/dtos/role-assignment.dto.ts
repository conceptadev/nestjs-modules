import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { ReferenceId, RoleAssignmentInterface } from '@concepta/nestjs-common';

import { DomainAggregateDto } from '../../../../nestjs-common/dist/index-aggregate';

@Exclude()
export class RoleAssignmentDto
  extends DomainAggregateDto
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
