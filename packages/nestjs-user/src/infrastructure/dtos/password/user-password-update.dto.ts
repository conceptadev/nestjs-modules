import { Exclude, Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { PasswordPlainCurrentInterface } from '@concepta/nestjs-password';

import { UserPasswordDto } from './user-password.dto';

@Exclude()
export class UserPasswordUpdateDto
  extends UserPasswordDto
  implements Partial<PasswordPlainCurrentInterface>
{
  @Expose({ toClassOnly: true })
  @ApiProperty({
    type: 'string',
    description: 'Current password to validate',
    required: false,
  })
  @IsOptional()
  @IsString()
  passwordCurrent?: string;
}
