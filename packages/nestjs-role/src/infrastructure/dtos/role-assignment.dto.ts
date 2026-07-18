import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { ReferenceId } from '@concepta/nestjs-core';
import { DomainAggregateDto } from '@concepta/nestjs-core/aggregate';

import { RoleAssignmentInterface } from '../../domain/interfaces/role-assignment.interface.js';

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
