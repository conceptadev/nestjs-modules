import { Exclude, Expose } from 'class-transformer';
import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { LiteralObject } from '@concepta/nestjs-common';
import { DomainAggregateDto } from '@concepta/nestjs-common/aggregate';

import { InvitationInterface } from '../../domain/interfaces/invitation.interface';

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
  constraints!: LiteralObject | undefined;

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
