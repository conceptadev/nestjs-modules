import { Exclude, Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { DomainAggregateDto } from '@concepta/rockets-app/aggregate';

import { RoleInterface } from '../../domain/interfaces/role.interface';

@Exclude()
export class RoleDto extends DomainAggregateDto implements RoleInterface {
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Name of the role',
  })
  @IsString()
  name = '';

  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Description of the role',
  })
  @IsString()
  @IsOptional()
  description = '';
}
