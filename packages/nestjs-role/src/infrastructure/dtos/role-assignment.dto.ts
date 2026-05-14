import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { ReferenceId } from '@concepta/rockets-app';
import { DomainAggregateDto } from '@concepta/rockets-app/aggregate';

import { RoleAssignmentInterface } from '../../domain/interfaces/role-assignment.interface';

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
