import { Exclude, Expose, Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

import { CrudResponsePaginatedDto } from '@concepta/nestjs-crud';

import { CacheDto } from './cache.dto.js';

@Exclude()
export class CachePaginatedDto extends CrudResponsePaginatedDto<CacheDto> {
  @Expose()
  @ApiProperty({
    type: CacheDto,
    isArray: true,
    description: 'Array of Caches',
  })
  @Type(() => CacheDto)
  data: CacheDto[] = [];
}
