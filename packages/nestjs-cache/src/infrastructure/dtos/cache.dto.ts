import { Exclude, Expose, Type } from 'class-transformer';
import { Allow, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { CacheInterface, CommonEntityDto } from '@concepta/nestjs-common';

/**
 * Cache DTO
 */
@Exclude()
export class CacheDto extends CommonEntityDto implements CacheInterface {
  /**
   * key
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'key',
  })
  @IsString()
  key = '';

  /**
   * data
   */
  @Expose()
  @IsString()
  @ApiProperty({
    type: 'string',
    description: 'data',
  })
  @IsOptional()
  data!: string | null;

  /**
   * type
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'type',
  })
  @IsString()
  type = '';

  /**
   * Expressed in seconds or a string describing a time span [zeit/ms](https://github.com/zeit/ms.js).
   *
   * Eg: 60, "2 days", "10h", "7d"
   */
  @Expose()
  @IsString()
  @ApiProperty({
    type: 'string',
    description: 'Expiration duration expressed as a time span',
    examples: ['60', '2 days', '10h', '7d'],
  })
  @IsOptional()
  expiresIn!: string | null;

  /**
   * Assignee
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'assignee id',
  })
  @IsString()
  @IsNotEmpty()
  assigneeId!: string;

  /**
   * expirationDate
   */
  @Expose()
  @ApiProperty({
    type: Date,
    description: 'Expiration date of the cache entry',
    required: false,
    nullable: true,
  })
  @Allow()
  @Type(() => Date)
  @IsOptional()
  expirationDate!: Date | null;
}
