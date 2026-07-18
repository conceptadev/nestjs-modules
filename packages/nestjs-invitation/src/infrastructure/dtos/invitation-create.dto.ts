import { Exclude } from 'class-transformer';

import { IntersectionType, PartialType, PickType } from '@nestjs/swagger';

import { InvitationCreatableInterface } from '../../domain/interfaces/invitation-creatable.interface.js';

import { InvitationDto } from './invitation.dto.js';

@Exclude()
export class InvitationCreateDto
  extends IntersectionType(
    PickType(InvitationDto, ['category', 'userId', 'code'] as const),
    PartialType(PickType(InvitationDto, ['constraints'] as const)),
  )
  implements InvitationCreatableInterface {}
