import { Exclude, Expose, Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

import { CrudCreateBatchDto } from '../../../infrastructure/dtos/crud-create-batch.dto';

import { PhotoCreateDtoFixture } from './photo-create.dto.fixture';

@Exclude()
export class PhotoCreateBatchDtoFixture extends CrudCreateBatchDto<PhotoCreateDtoFixture> {
  @Expose()
  @ApiProperty({ type: PhotoCreateDtoFixture, isArray: true })
  @Type(() => PhotoCreateDtoFixture)
  bulk: PhotoCreateDtoFixture[] = [];
}
