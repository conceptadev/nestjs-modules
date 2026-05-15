import { Exclude, Expose, Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

import { CrudInvalidResponseDto } from './crud-invalid-response.dto';
import { CrudResponsePaginatedInterface } from './interfaces/crud-response-paginated.interface';

@Exclude()
export class CrudResponsePaginatedDto<T>
  implements CrudResponsePaginatedInterface<T>
{
  @Expose()
  @ApiProperty({
    type: CrudInvalidResponseDto,
    isArray: true,
    description: 'The list of records for current page',
  })
  @Type(() => CrudInvalidResponseDto)
  data: T[] = [];

  @Expose()
  @ApiProperty({ type: 'number', description: 'Limit number of items' })
  limit = 0;

  @Expose()
  @ApiProperty({ type: 'number', description: 'Count of all records' })
  count = 0;

  @Expose()
  @ApiProperty({
    type: 'number',
    description: 'Count of records on current page',
  })
  total = 0;

  @Expose()
  @ApiProperty({ type: 'number', description: 'Current page number' })
  page = 0;

  @Expose()
  @ApiProperty({ type: 'number', description: 'Total number of pages' })
  pageCount = 0;
}
