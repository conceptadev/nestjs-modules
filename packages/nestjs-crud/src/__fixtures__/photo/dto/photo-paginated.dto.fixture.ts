import { Exclude, Expose, Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

import { CrudResponsePaginatedDto } from '../../../infrastructure/dtos/crud-response-paginated.dto.js';

import { PhotoDtoFixture } from './photo.dto.fixture.js';

@Exclude()
export class PhotoPaginatedDtoFixture extends CrudResponsePaginatedDto<PhotoDtoFixture> {
  @ApiProperty({ type: [PhotoDtoFixture], isArray: true })
  @Expose()
  @Type(() => PhotoDtoFixture)
  data: PhotoDtoFixture[] = [];
}
