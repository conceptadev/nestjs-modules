import { Exclude, Expose, Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

import { CrudCreateBatchDto } from '../../../../infrastructure/dtos/crud-create-batch.dto';

import { CompanyCreateDto } from './company-create.dto';

@Exclude()
export class CompanyCreateBatchDto extends CrudCreateBatchDto<CompanyCreateDto> {
  @Expose()
  @ApiProperty({ type: CompanyCreateDto, isArray: true })
  @Type(() => CompanyCreateDto)
  bulk: CompanyCreateDto[] = [];
}
