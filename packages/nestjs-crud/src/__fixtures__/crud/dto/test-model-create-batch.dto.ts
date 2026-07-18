import { Exclude, Expose, Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

import { CrudCreateBatchDto } from '../../../infrastructure/dtos/crud-create-batch.dto.js';

import { TestModelCreateDto } from './test-model-create.dto.js';

@Exclude()
export class TestModelCreateBatchDto extends CrudCreateBatchDto<TestModelCreateDto> {
  @Expose()
  @ApiProperty({ type: TestModelCreateDto, isArray: true })
  @Type(() => TestModelCreateDto)
  bulk: TestModelCreateDto[] = [];
}
