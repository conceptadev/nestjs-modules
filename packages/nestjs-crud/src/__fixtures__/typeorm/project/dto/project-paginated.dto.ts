import { Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

import { CrudResponsePaginatedDto } from '../../../../infrastructure/dtos/crud-response-paginated.dto.js';

import { ProjectDto } from './project.dto.js';

export class ProjectPaginatedDto extends CrudResponsePaginatedDto<ProjectDto> {
  @ApiProperty({
    type: ProjectDto,
    isArray: true,
  })
  @Type(() => ProjectDto)
  data!: ProjectDto[];
}
