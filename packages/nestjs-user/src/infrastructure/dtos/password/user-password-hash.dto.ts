import { Exclude, Expose } from 'class-transformer';
import { IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { PasswordStorageInterface } from '@concepta/nestjs-common';

@Exclude()
export class UserPasswordHashDto implements PasswordStorageInterface {
  @Expose({ toClassOnly: true })
  @ApiProperty({
    type: 'string',
    description: 'Password hash',
  })
  @IsString()
  passwordHash!: string;

  @Expose({ toClassOnly: true })
  @ApiProperty({
    type: 'string',
    description: 'Password salt',
  })
  @IsString()
  passwordSalt!: string;
}
