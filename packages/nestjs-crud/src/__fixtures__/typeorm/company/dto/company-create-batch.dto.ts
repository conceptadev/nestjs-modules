import { Exclude, Expose, Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

import { CrudCreateBatchDto } from '../../../../infrastructure/dtos/crud-create-batch.dto.js';

import { CompanyCreateDto } from './company-create.dto.js';

@Exclude()
export class CompanyCreateBatchDto extends CrudCreateBatchDto<CompanyCreateDto> {
  @Expose()
  @ApiProperty({ type: CompanyCreateDto, isArray: true })
  @Type(() => CompanyCreateDto)
  bulk: CompanyCreateDto[] = [];
}
