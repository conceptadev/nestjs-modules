import { Exclude, Expose } from 'class-transformer';
import { IsEmail } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class RecoveryRecoverPasswordDto {
  @Expose()
  @ApiProperty({
    title: 'user email',
    type: 'string',
    description:
      'Recover email password by providing an email that will receive a password reset link',
  })
  @IsEmail()
  declare email: string;
}
