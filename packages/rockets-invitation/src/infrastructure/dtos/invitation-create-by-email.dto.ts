import { Exclude, Expose } from 'class-transformer';
import { IsEmail } from 'class-validator';

import { ApiProperty, PickType } from '@nestjs/swagger';

import { InvitationCreatableByEmailInterface } from '../../domain/interfaces/invitation-creatable-by-email.interface';

import { InvitationCreateDto } from './invitation-create.dto';

@Exclude()
export class InvitationCreateByEmailDto
  extends PickType(InvitationCreateDto, ['category', 'constraints'] as const)
  implements InvitationCreatableByEmailInterface
{
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Email that the invitation will be sent to',
  })
  @IsEmail()
  email = '';
}
