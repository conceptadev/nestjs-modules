import { Exclude, Expose } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { PasswordPlainInterface } from '@concepta/nestjs-password';

@Exclude()
export class UserPasswordDto implements PasswordPlainInterface {
  @Expose({ toClassOnly: true })
  @ApiProperty({
    type: 'string',
    description: 'Plain text password to set',
  })
  @IsString()
  @MinLength(8)
  password!: string;
}
