import { Exclude, Expose, Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

import { CrudCreateBatchDto } from '../../../infrastructure/dtos/crud-create-batch.dto.js';

import { PhotoCreateDtoFixture } from './photo-create.dto.fixture.js';

@Exclude()
export class PhotoCreateBatchDtoFixture extends CrudCreateBatchDto<PhotoCreateDtoFixture> {
  @Expose()
  @ApiProperty({ type: PhotoCreateDtoFixture, isArray: true })
  @Type(() => PhotoCreateDtoFixture)
  bulk: PhotoCreateDtoFixture[] = [];
}
