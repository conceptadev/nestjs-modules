import { Exclude } from 'class-transformer';

import { PickType } from '@nestjs/swagger';

import { IdentityCreatableInterface } from '../../domain/interfaces/identity-creatable.interface';

import { IdentityDto } from './identity.dto';

@Exclude()
export class IdentityCreateDto
  extends PickType(IdentityDto, ['provider', 'subject', 'user'] as const)
  implements IdentityCreatableInterface {}
