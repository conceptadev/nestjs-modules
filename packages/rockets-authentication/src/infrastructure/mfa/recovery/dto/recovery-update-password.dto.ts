import { IsString, MaxLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class RecoveryUpdatePasswordDto {
  @ApiProperty({
    title: 'account reset passcode',
    type: 'string',
    description: 'Passcode used to reset account password',
  })
  @IsString()
  @MaxLength(36)
  passcode = '';

  @ApiProperty({
    title: 'account new password',
    type: 'string',
    description: 'New password account',
  })
  @IsString()
  @MaxLength(72)
  newPassword = '';
}
