import { Exclude } from 'class-transformer';

import { PickType } from '@nestjs/swagger';

import { IdentityCreatableInterface } from '../../domain/interfaces/identity-creatable.interface.js';

import { IdentityDto } from './identity.dto.js';

@Exclude()
export class IdentityCreateDto
  extends PickType(IdentityDto, ['provider', 'subject', 'user'] as const)
  implements IdentityCreatableInterface {}
