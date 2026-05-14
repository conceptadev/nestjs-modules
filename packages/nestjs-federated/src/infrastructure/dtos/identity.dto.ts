import { Exclude, Expose, Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { ReferenceIdDto, ReferenceIdInterface } from '@concepta/rockets-app';
import { DomainAggregateDto } from '@concepta/rockets-app/aggregate';

import { IdentityInterface } from '../../domain/interfaces/identity.interface';

@Exclude()
export class IdentityDto
  extends DomainAggregateDto
  implements IdentityInterface
{
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Provider of the identity',
  })
  @IsString()
  provider = '';

  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Subject of the identity',
  })
  @IsString()
  subject = '';

  @Expose()
  @ApiProperty({
    type: ReferenceIdDto,
    description: 'User reference',
  })
  @Type(() => ReferenceIdDto)
  @ValidateNested()
  user: ReferenceIdInterface = new ReferenceIdDto();
}
