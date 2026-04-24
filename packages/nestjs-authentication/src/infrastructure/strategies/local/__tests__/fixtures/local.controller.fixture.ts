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
import { LocalLoginDto } from '../../dto/local-login.dto';
import { LocalGuard } from '../../local.guard';

/**
 * Auth Local controller
 */
@Controller('auth/login')
@UseGuards(LocalGuard)
@AuthPublic({ classLevel: true })
@ApiTags('auth')
export class LocalControllerFixture {
  constructor(private readonly commandBus: CommandBus) {}

  /**
   * Login
   */
  @ApiBody({
    type: LocalLoginDto,
    description: 'DTO containing username and password.',
  })
  @ApiOkResponse({
    type: AuthenticationResponseDto,
    description: 'DTO containing an access token and a refresh token.',
  })
  @ApiUnauthorizedResponse()
  @Post()
  async login(
    @AuthUser() user: AuthenticatedUserInterface,
  ): Promise<AuthenticatedResponseInterface> {
    return this.commandBus.execute(
      new IssueAuthenticatedResponseCommand({}, user.id),
    );
  }
}
