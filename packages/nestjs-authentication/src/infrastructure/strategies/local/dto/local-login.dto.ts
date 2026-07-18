import { Exclude, Expose } from 'class-transformer';
import { IsString, MaxLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { AuthenticationLoginInterface } from '../../../../domain/interfaces/authentication-login.interface.js';

@Exclude()
export class LocalLoginDto implements AuthenticationLoginInterface {
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Username',
  })
  @IsString()
  @MaxLength(255)
  username = '';

  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Password',
  })
  @IsString()
  @MaxLength(72)
  password = '';
}
