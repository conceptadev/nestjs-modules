import { Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

import { CrudResponsePaginatedDto } from '../../../../infrastructure/dtos/crud-response-paginated.dto.js';

import { CompanyDto } from './company.dto.js';

export class CompanyPaginatedDto extends CrudResponsePaginatedDto<CompanyDto> {
  @ApiProperty({
    type: CompanyDto,
    isArray: true,
  })
  @Type(() => CompanyDto)
  data!: CompanyDto[];
}
