import { IsString, MaxLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class RecoveryValidatePasscodeDto {
  @ApiProperty({
    title: 'User passcode',
    type: 'string',
    description: 'User passcode used to verify if it valid or not.',
  })
  @IsString()
  @MaxLength(36)
  passcode = '';
}
