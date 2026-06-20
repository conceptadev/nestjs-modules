import { Inject, Injectable, PlainLiteralObject } from '@nestjs/common';

import {
  AssigneeRelationInterface,
  ReferenceIdInterface,
} from '@concepta/nestjs-core';

import {
  AUTHENTICATION_OTP_PORT_TOKEN,
  AUTHENTICATION_USER_PORT_TOKEN,
  AUTHENTICATION_VERIFY_NOTIFICATION_PORT_TOKEN,
} from '../../../authentication.constants';
import { VerifyPolicy } from '../../../domain/policies/verify.policy';
import { OtpPort } from '../../../domain/ports/otp.port';
import { UserPort } from '../../../domain/ports/user.port';
import { VerifyNotificationPort } from '../../../domain/ports/verify-notification.port';
import { VerifyOtpInvalidException } from '../../exceptions/verify-otp-invalid.exception';

import { VerifyConfirmParamsInterface } from './interfaces/verify-confirm-params.interface';
import { VerifySendParamsInterface } from './interfaces/verify-send-params.interface';

@Injectable()
export class VerifyService {
  constructor(
    @Inject(VerifyPolicy)
    private readonly policy: VerifyPolicy,
    @Inject(AUTHENTICATION_OTP_PORT_TOKEN)
    private readonly otpPort: OtpPort,
    @Inject(AUTHENTICATION_USER_PORT_TOKEN)
    private readonly userPort: UserPort,
    @Inject(AUTHENTICATION_VERIFY_NOTIFICATION_PORT_TOKEN)
    private readonly verifyNotificationPort: VerifyNotificationPort,
  ) {}

  /**
   * Send an email to verify a user's email address.
   *
   * @param ctx - context
   * @param params - Parameters for sending verification email
   */
  async send(
    ctx: PlainLiteralObject,
    params: VerifySendParamsInterface,
  ): Promise<void> {
    const { email } = params;

    const user = await this.userPort.getByEmail(ctx, email);

    if (user) {
      const {
        otpCategory: category,
        otpNamespace: namespace,
        otpType: type,
        otpExpiresIn: expiresIn,
        otpDuplicateStrategy: duplicateStrategy,
        otpRateSeconds: rateSeconds,
        otpRateThreshold: rateThreshold,
      } = this.policy;

      const otp = await this.otpPort.create(
        ctx,
        namespace,
        {
          category,
          type,
          expiresIn,
          assigneeId: user.id,
          rateSeconds,
          rateThreshold,
        },
        { duplicateStrategy, rateSeconds, rateThreshold },
      );

      this.verifyNotificationPort.sendVerify(ctx, email, {
        passcode: otp.passcode,
        tokenExp: otp.expirationDate,
      });
    }

    // !!! Falling through to void is intentional              !!!!
    // !!! Do NOT give any indication if e-mail does not exist !!!!
  }

  /**
   * Validate a passcode OTP.
   *
   * @param ctx - context
   * @param params - Parameters for validating passcode
   */
  async validatePasscode(
    ctx: PlainLiteralObject,
    params: VerifyConfirmParamsInterface,
  ): Promise<AssigneeRelationInterface | null> {
    const { passcode } = params;
    const { otpCategory: category, otpNamespace: namespace } = this.policy;

    return this.otpPort.validate(ctx, namespace, { category, passcode });
  }

  /**
   * Confirms a user's account by validating their OTP passcode.
   *
   * @param ctx - context
   * @param params - Parameters for confirming user
   */
  async confirmUser(
    ctx: PlainLiteralObject,
    params: VerifyConfirmParamsInterface,
  ): Promise<ReferenceIdInterface | null> {
    const { passcode } = params;

    const otp = await this.validatePasscode(ctx, { passcode });

    if (otp) {
      const user = await this.userPort.update(ctx, otp.assigneeId, {
        active: true,
      });

      if (user) {
        await this.revokeAllUserVerifyToken(ctx, {
          email: user.email,
        });

        return user;
      }
    }

    throw new VerifyOtpInvalidException();
  }

  /**
   * Revokes all verification tokens for a given user.
   *
   * @param ctx - context
   * @param params - Parameters for revoking tokens
   */
  async revokeAllUserVerifyToken(
    ctx: PlainLiteralObject,
    params: VerifySendParamsInterface,
  ): Promise<void> {
    const { email } = params;
    const user = await this.userPort.getByEmail(ctx, email);

    if (user) {
      const { otpCategory: category, otpNamespace: namespace } = this.policy;
      await this.otpPort.clear(ctx, namespace, {
        category,
        assigneeId: user.id,
      });
    }
  }
}
