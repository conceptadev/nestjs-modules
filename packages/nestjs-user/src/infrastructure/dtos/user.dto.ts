import { Exclude, Expose } from 'class-transformer';
import { IsBoolean, IsEmail, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { DomainAggregateDto } from '@concepta/nestjs-core/aggregate';

import { UserInterface } from '../../domain/interfaces/user.interface';

@Exclude()
export class UserDto extends DomainAggregateDto implements UserInterface {
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Email',
  })
  @IsEmail()
  email!: string;

  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Username',
  })
  @IsString()
  username!: string;

  @Expose()
  @ApiProperty({
    type: 'boolean',
    description: 'Active',
  })
  @IsBoolean()
  active!: boolean;
}
