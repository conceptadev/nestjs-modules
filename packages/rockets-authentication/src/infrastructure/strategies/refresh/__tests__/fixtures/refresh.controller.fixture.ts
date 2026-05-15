import { Controller, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBody,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { IssueAuthenticatedResponseCommand } from '../../../../../application/commands/impl/issue-authenticated-response.command';
import { AuthenticatedResponseInterface } from '../../../../../domain/interfaces/authenticated-response.interface';
import { AuthenticatedUserInterface } from '../../../../../domain/interfaces/authenticated-user.interface';
import { AuthPublic } from '../../../../decorators/auth-public.decorator';
import { AuthUser } from '../../../../decorators/auth-user.decorator';
import { AuthenticationResponseDto } from '../../../../dtos/authenticated-response.dto';
import { RefreshDto } from '../../dto/refresh.dto';
import { RefreshGuard } from '../../refresh.guard';

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
