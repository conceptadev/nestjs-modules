import { Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

import { CrudResponsePaginatedDto } from '../../../../infrastructure/dtos/crud-response-paginated.dto';

import { NoteDto } from './note.dto';

export class NotePaginatedDto extends CrudResponsePaginatedDto<NoteDto> {
  @ApiProperty({
    type: NoteDto,
    isArray: true,
  })
  @Type(() => NoteDto)
  data!: NoteDto[];
}
