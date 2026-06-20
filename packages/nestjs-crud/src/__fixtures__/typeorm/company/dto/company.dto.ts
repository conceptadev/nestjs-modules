import { Exclude, Expose, Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

import { UserDto } from '../../users/dto/user.dto';

export class CompanyDto {
  @Expose()
  @ApiProperty({ type: 'number' })
  id?: number;

  @Expose()
  @ApiProperty({ type: 'string' })
  name!: string;

  @Expose()
  @ApiProperty({ type: 'string' })
  domain!: string;

  @Expose()
  @ApiProperty({ type: 'string' })
  description!: string;

  @Exclude()
  createdAt!: string;

  @Exclude()
  updatedAt!: string;

  @Expose()
  @Type(() => UserDto)
  users?: UserDto[];
}
