import { Exclude, Expose, Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

import { CacheInterface } from '@concepta/nestjs-common';
import { CrudResponsePaginatedDto } from '@concepta/nestjs-crud';

import { CacheDto } from './cache.dto';

/**
 * Cache paginated DTO
 */
@Exclude()
export class CachePaginatedDto extends CrudResponsePaginatedDto<CacheInterface> {
  @Expose()
  @ApiProperty({
    type: CacheDto,
    isArray: true,
    description: 'Array of Caches',
  })
  @Type(() => CacheDto)
  data: CacheDto[] = [];
}
