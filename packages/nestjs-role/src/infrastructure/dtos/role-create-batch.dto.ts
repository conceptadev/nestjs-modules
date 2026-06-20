import { Exclude, Expose, Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { CrudCreateBatchDto } from '@concepta/nestjs-crud';

import { RoleCreatableInterface } from '../../domain/interfaces/role-creatable.interface';

import { RoleCreateDto } from './role-create.dto';

/**
 * Role Create Batch DTO
 */
@Exclude()
export class RoleCreateBatchDto extends CrudCreateBatchDto<RoleCreatableInterface> {
  @Expose()
  @ApiProperty({
    type: RoleCreateDto,
    isArray: true,
    description: 'Array of Roles to create',
  })
  @Type(() => RoleCreateDto)
  @IsArray()
  @ArrayNotEmpty()
  bulk: RoleCreateDto[] = [];
}
