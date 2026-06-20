import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  PlainLiteralObject,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { Ctx } from '@concepta/nestjs-core';

import { RecoveryService } from '../../../../../application/services/recovery/recovery.service';
import { AuthPublic } from '../../../../decorators/auth-public.decorator';
import { RecoveryRecoverLoginDto } from '../../dto/recovery-recover-login.dto';
import { RecoveryRecoverPasswordDto } from '../../dto/recovery-recover-password.dto';
import { RecoveryUpdatePasswordDto } from '../../dto/recovery-update-password.dto';
import { RecoveryOtpInvalidException } from '../../exceptions/recovery-otp-invalid.exception';

@Controller('auth/recovery')
@AuthPublic({ classLevel: true })
@ApiTags('auth')
export class RecoveryController {
  constructor(
    @Inject(RecoveryService)
    private readonly recoveryService: RecoveryService,
  ) {}

  @ApiOperation({
    summary:
      'Recover account username password by providing an email that will receive an username.',
  })
  @ApiBody({
    type: RecoveryRecoverLoginDto,
    description: 'DTO of login recover.',
  })
  @ApiOkResponse()
  @Post('/login')
  async recoverLogin(
    @Ctx() ctx: PlainLiteralObject,
    @Body() recoverLoginDto: RecoveryRecoverLoginDto,
  ): Promise<void> {
    await this.recoveryService.recoverLogin(ctx, recoverLoginDto.email);
  }

  @ApiOperation({
    summary:
      'Recover account email password by providing an email that will receive a password reset link.',
  })
  @ApiBody({
    type: RecoveryRecoverPasswordDto,
    description: 'DTO of email recover.',
  })
  @ApiOkResponse()
  @Post('/password')
  async recoverPassword(
    @Ctx() ctx: PlainLiteralObject,
    @Body() recoverPasswordDto: RecoveryRecoverPasswordDto,
  ): Promise<void> {
    await this.recoveryService.recoverPassword(ctx, recoverPasswordDto.email);
  }

  @ApiOperation({
    summary: 'Check if passcode is valid.',
  })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @Get('/passcode/:passcode')
  async validatePasscode(
    @Ctx() ctx: PlainLiteralObject,
    @Param('passcode') passcode: string,
  ): Promise<void> {
    const otp = await this.recoveryService.validatePasscode(ctx, passcode);

    if (!otp) {
      throw new RecoveryOtpInvalidException();
    }
  }

  @ApiOperation({
    summary: 'Update lost password by providing passcode and new password.',
  })
  @ApiBody({
    type: RecoveryUpdatePasswordDto,
    description: 'DTO of update password.',
  })
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @Patch('/password')
  async updatePassword(
    @Ctx() ctx: PlainLiteralObject,
    @Body() updatePasswordDto: RecoveryUpdatePasswordDto,
  ): Promise<void> {
    const { passcode, newPassword } = updatePasswordDto;

    const user = await this.recoveryService.updatePassword(
      ctx,
      passcode,
      newPassword,
    );

    if (!user) {
      // the client should have checked using validate passcode first
      throw new RecoveryOtpInvalidException();
    }
  }
}
