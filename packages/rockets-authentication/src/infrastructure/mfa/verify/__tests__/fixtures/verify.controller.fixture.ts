import {
  Body,
  Controller,
  Patch,
  PlainLiteralObject,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { Ctx } from '@concepta/rockets-app';

import { VerifyService } from '../../../../../application/services/verify/verify.service';
import { AuthPublic } from '../../../../decorators/auth-public.decorator';
import { VerifyUpdateDto } from '../../dto/verify-update.dto';
import { VerifyDto } from '../../dto/verify.dto';

@Controller('auth/verify')
@AuthPublic({ classLevel: true })
@ApiTags('auth')
export class VerifyControllerFixture {
  constructor(private readonly verifyService: VerifyService) {}

  @ApiOperation({
    summary:
      'Send Verify account email by providing an email that will receive link to confirm account.',
  })
  @ApiBody({
    type: VerifyDto,
    description: 'DTO of email verify.',
  })
  @ApiOkResponse()
  @Post('/send')
  async send(
    @Ctx() ctx: PlainLiteralObject,
    @Body() verifyDto: VerifyDto,
  ): Promise<void> {
    await this.verifyService.send(ctx, { email: verifyDto.email });
  }

  @ApiOperation({
    summary: 'confirm email providing passcode.',
  })
  @ApiBody({
    type: VerifyUpdateDto,
    description: 'DTO of verify email.',
  })
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @Patch('/confirm')
  async confirm(
    @Ctx() ctx: PlainLiteralObject,
    @Body() verifyUpdateDto: VerifyUpdateDto,
  ): Promise<void> {
    const { passcode } = verifyUpdateDto;

    await this.verifyService.confirmUser(ctx, { passcode });
  }
}
