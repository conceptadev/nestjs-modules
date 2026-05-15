import { Exclude, Expose, Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { CrudCreateBatchDto } from '@concepta/rockets-crud';

import { RoleAssignmentCreatableInterface } from '../../domain/interfaces/role-assignment-creatable.interface';

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
