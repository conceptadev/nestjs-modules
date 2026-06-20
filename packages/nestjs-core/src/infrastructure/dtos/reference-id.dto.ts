import { Exclude, Expose } from 'class-transformer';
import { IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { ReferenceIdInterface } from '../../domain/reference/interfaces/reference-id.interface';

@Exclude()
export class ReferenceIdDto implements ReferenceIdInterface {
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Unique identifier',
  })
  @IsString()
  id = '';
}
