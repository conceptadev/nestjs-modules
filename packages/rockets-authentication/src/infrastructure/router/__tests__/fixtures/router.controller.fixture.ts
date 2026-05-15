import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AuthenticatedUserInterface } from '../../../../domain/interfaces/authenticated-user.interface';
import { AuthPublic } from '../../../decorators/auth-public.decorator';
import { AuthUser } from '../../../decorators/auth-user.decorator';
import { AuthenticationResponseDto } from '../../../dtos/authenticated-response.dto';
import { AuthRouterGuard } from '../../auth-router.guard';

@Controller('auth-router')
@UseGuards(AuthRouterGuard)
@AuthPublic({ classLevel: true })
@ApiTags('auth')
export class RouterControllerFixture {
  constructor() {}

  /**
   * Login
   */
  @ApiOkResponse({
    description: 'Users are redirected to request their Auth Router identity.',
  })
  @Get('login')
  login(): void {
    return;
  }

  @ApiOkResponse({
    type: AuthenticationResponseDto,
    description: 'DTO containing an access token and a refresh token.',
  })
  @Get('callback')
  async callback(@AuthUser() _user: AuthenticatedUserInterface) {
    return {
      ok: 'success',
    };
  }

  @ApiOkResponse({
    type: AuthenticationResponseDto,
    description: 'DTO containing an access token and a refresh token.',
  })
  @Post('callback')
  async postCallback(@AuthUser() _user: AuthenticatedUserInterface) {
    return {
      ok: 'success',
    };
  }
}
