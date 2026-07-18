import { Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

import { CrudResponsePaginatedDto } from '../../../../infrastructure/dtos/crud-response-paginated.dto.js';

import { NoteDto } from './note.dto.js';

export class NotePaginatedDto extends CrudResponsePaginatedDto<NoteDto> {
  @ApiProperty({
    type: NoteDto,
    isArray: true,
  })
  @Type(() => NoteDto)
  data!: NoteDto[];
}
