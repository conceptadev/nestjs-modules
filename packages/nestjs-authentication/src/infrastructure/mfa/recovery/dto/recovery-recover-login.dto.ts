import { Exclude, Expose } from 'class-transformer';
import { IsEmail } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class RecoveryRecoverLoginDto {
  @Expose()
  @ApiProperty({
    title: 'user email',
    type: 'string',
    description:
      'Recover email login by providing an email that will receive an username',
  })
  @IsEmail()
  declare email: string;
}
