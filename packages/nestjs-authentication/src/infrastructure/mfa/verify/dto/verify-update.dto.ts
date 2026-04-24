import { IsString, MaxLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class VerifyUpdateDto {
  @ApiProperty({
    title: 'account confirm passcode',
    type: 'string',
    description: 'Passcode used to confirm account',
  })
  @IsString()
  @MaxLength(36)
  passcode = '';
}
