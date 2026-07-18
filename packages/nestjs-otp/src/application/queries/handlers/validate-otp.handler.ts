import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { AssigneeRelationInterface } from '@concepta/nestjs-core';

import { OtpTypeNotDefinedException } from '../../../domain/exceptions/otp-type-not-defined.exception.js';
import { OtpRepositoryResolverInterface } from '../../../domain/repositories/otp-repository-resolver.interface.js';
import { OtpSettingsInterface } from '../../../infrastructure/config/interfaces/otp-settings.interface.js';
import {
  OTP_MODULE_SETTINGS_TOKEN,
  OTP_REPOSITORY_RESOLVER_TOKEN,
} from '../../../otp.constants.js';
import { ValidateOtpQuery } from '../impl/validate-otp.query.js';

@QueryHandler(ValidateOtpQuery)
export class ValidateOtpHandler implements IQueryHandler<ValidateOtpQuery> {
  constructor(
    @Inject(OTP_REPOSITORY_RESOLVER_TOKEN)
    private readonly repositoryResolver: OtpRepositoryResolverInterface,
    @Inject(OTP_MODULE_SETTINGS_TOKEN)
    private readonly settings: OtpSettingsInterface,
  ) {}

  async execute(
    query: ValidateOtpQuery,
  ): Promise<AssigneeRelationInterface | null> {
    const { ctx, namespace, otp } = query;
    const { category, passcode } = otp;

    const otpRepo = this.repositoryResolver.resolve(namespace);

    const activeOtp = await otpRepo.findActiveByPasscode(ctx, {
      category,
      passcode,
    });

    if (!activeOtp || activeOtp.isExpired()) {
      return null;
    }

    const { type } = activeOtp;
    const typeConfig = this.settings.types[type];
    if (!typeConfig) {
      throw new OtpTypeNotDefinedException(type);
    }

    if (!typeConfig.validator(passcode, activeOtp.passcode)) {
      return null;
    }

    return { assigneeId: activeOtp.assigneeId };
  }
}
