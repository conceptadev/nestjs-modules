import { Controller, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBody,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { IssueAuthenticatedResponseCommand } from '../../../../../application/commands/impl/issue-authenticated-response.command.js';
import { AuthenticatedResponseInterface } from '../../../../../domain/interfaces/authenticated-response.interface.js';
import { AuthenticatedUserInterface } from '../../../../../domain/interfaces/authenticated-user.interface.js';
import { AuthPublic } from '../../../../decorators/auth-public.decorator.js';
import { AuthUser } from '../../../../decorators/auth-user.decorator.js';
import { AuthenticationResponseDto } from '../../../../dtos/authenticated-response.dto.js';
import { RefreshDto } from '../../dto/refresh.dto.js';
import { RefreshGuard } from '../../refresh.guard.js';

/**
 * Auth Local controller
 */
@Controller('token/refresh')
@UseGuards(RefreshGuard)
@AuthPublic({ classLevel: true })
@ApiTags('auth')
export class RefreshControllerFixture {
  constructor(private readonly commandBus: CommandBus) {}

  /**
   * Login
   */
  @ApiBody({
    type: RefreshDto,
    description: 'DTO containing a refresh token.',
  })
  @ApiOkResponse({
    type: AuthenticationResponseDto,
    description: 'DTO containing an access token and a refresh token.',
  })
  @ApiUnauthorizedResponse()
  @Post()
  async refresh(
    @AuthUser() user: AuthenticatedUserInterface,
  ): Promise<AuthenticatedResponseInterface> {
    return this.commandBus.execute(
      new IssueAuthenticatedResponseCommand({}, user.id),
    );
  }
}
