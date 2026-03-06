import { Exclude, Expose, Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { RoleAssignmentCreatableInterface } from '@concepta/nestjs-common';
import { CrudCreateBatchDto } from '@concepta/nestjs-crud';

import { RoleAssignmentCreateDto } from './role-assignment-create.dto';

/**
 * Role Assignment Create Batch DTO
 */
@Exclude()
export class RoleAssignmentCreateBatchDto extends CrudCreateBatchDto<RoleAssignmentCreatableInterface> {
  @Expose()
  @ApiProperty({
    type: RoleAssignmentCreateDto,
    isArray: true,
    description: 'Array of Role Assignments to create',
  })
  @Type(() => RoleAssignmentCreateDto)
  @IsArray()
  @ArrayNotEmpty()
  bulk: RoleAssignmentCreateDto[] = [];
}
