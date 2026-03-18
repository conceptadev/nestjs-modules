import { Exclude, Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { RoleInterface } from '@concepta/nestjs-common';
import { DomainAggregateDto } from '@concepta/nestjs-common/aggregate';

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
