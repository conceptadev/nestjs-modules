import { Expose } from 'class-transformer';
import { IsObject, IsOptional, IsString } from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { LiteralObject } from '@concepta/nestjs-common';

import { InvitationAcceptableInterface } from '../../domain/interfaces/invitation-acceptable.interface';

export class InvitationAcceptDto implements InvitationAcceptableInterface {
  @Expose()
  @ApiProperty({
    title: 'Passcode',
    type: 'string',
    description: 'Passcode used to activate account',
  })
  @IsString()
  passcode = '';

  @Expose()
  @ApiPropertyOptional({
    title: 'Payload',
    type: 'object',
    description:
      'Optional payload passed to the accepting module to complete activation (e.g. new password).' +
      ' Intentionally untyped to support varying module requirements.',
    additionalProperties: true,
  })
  @IsObject()
  @IsOptional()
  payload?: LiteralObject;
}
