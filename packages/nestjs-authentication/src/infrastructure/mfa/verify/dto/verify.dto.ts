import { Exclude, Expose } from 'class-transformer';
import { IsEmail } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class VerifyDto {
  @Expose()
  @ApiProperty({
    title: 'user email',
    type: 'string',
    description:
      'Verify email by providing an email that will receive a confirmation link',
  })
  @IsEmail()
  declare email: string;
}
