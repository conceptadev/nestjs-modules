import { Exclude, Expose } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { AuditInterface } from '../../domain/audit/interfaces/audit.interface';
import { ReferenceIdInterface } from '../../domain/reference/interfaces/reference-id.interface';
import { ReferenceVersionInterface } from '../../domain/reference/interfaces/reference-version.interface';

import { AuditDto } from './audit.dto';

@Exclude()
export class DomainAggregateDto
  extends AuditDto
  implements ReferenceIdInterface, ReferenceVersionInterface, AuditInterface
{
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Unique identifier',
  })
  @IsString()
  id!: string;

  @Expose()
  @ApiProperty({
    type: 'number',
    description: 'Version',
  })
  @IsNumber()
  version!: number;
}
