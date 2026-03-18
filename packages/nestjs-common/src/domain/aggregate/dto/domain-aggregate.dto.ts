import { Exclude, Expose } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { AuditDto } from '../../../audit/dto/audit.dto';
import { AuditInterface } from '../../../audit/interfaces/audit.interface';
import { ReferenceIdInterface } from '../../../reference/interfaces/reference-id.interface';
import { ReferenceVersionInterface } from '../../../reference/interfaces/reference-version.interface';

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
