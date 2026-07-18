import { Exclude, Expose } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

import { AuthenticatedResponseInterface } from '../../domain/interfaces/authenticated-response.interface.js';

@Exclude()
export class AuthenticationResponseDto implements AuthenticatedResponseInterface {
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'JWT access token to use for request authorization.',
  })
  accessToken = '';

  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'JWT refresh token to use for obtaining a new access token.',
  })
  refreshToken = '';
}
