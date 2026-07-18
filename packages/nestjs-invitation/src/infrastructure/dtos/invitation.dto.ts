import { Exclude, Expose } from 'class-transformer';
import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

import { PlainLiteralObject } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

import { DomainAggregateDto } from '@concepta/nestjs-core/aggregate';

import { InvitationInterface } from '../../domain/interfaces/invitation.interface.js';

@Exclude()
export class InvitationDto
  extends DomainAggregateDto
  implements InvitationInterface
{
  @Expose()
  @ApiProperty({
    type: 'boolean',
    description: 'True if Invitation is active',
  })
  @IsBoolean()
  active = true;

  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Code claim invitation',
  })
  @IsString()
  code = '';

  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Category of invitation',
  })
  @IsString()
  category = '';

  @Expose()
  @ApiProperty({
    type: 'object',
    description: 'Constraints payload for the invitation',
    additionalProperties: true,
  })
  @IsObject()
  @IsOptional()
  constraints!: PlainLiteralObject | undefined;

  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'The invited user ID.',
  })
  @IsString()
  userId!: string;

  @Expose()
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
    description: 'Date the invitation was accepted',
  })
  @IsOptional()
  dateAccepted!: Date | null;

  @Expose()
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
    description: 'Date the invitation was revoked',
  })
  @IsOptional()
  dateRevoked!: Date | null;
}
