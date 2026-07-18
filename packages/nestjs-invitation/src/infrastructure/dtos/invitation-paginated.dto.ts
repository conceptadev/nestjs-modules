import { Exclude, Expose, Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

import { CrudResponsePaginatedDto } from '@concepta/nestjs-crud';

import { InvitationDto } from './invitation.dto.js';

@Exclude()
export class InvitationPaginatedDto extends CrudResponsePaginatedDto<InvitationDto> {
  @Expose()
  @ApiProperty({
    type: InvitationDto,
    isArray: true,
    description: 'Array of Invitations',
  })
  @Type(() => InvitationDto)
  data: InvitationDto[] = [];
}
