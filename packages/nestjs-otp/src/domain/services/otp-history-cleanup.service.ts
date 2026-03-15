import { Inject, Injectable } from '@nestjs/common';

import { RepositoryContextInterface } from '@concepta/nestjs-common';

import { OTP_REPOSITORY_RESOLVER_TOKEN } from '../../otp.constants';
import { OtpRepositoryResolverInterface } from '../repositories/otp-repository-resolver.interface';

@Injectable()
export class OtpHistoryCleanupService {
  constructor(
    @Inject(OTP_REPOSITORY_RESOLVER_TOKEN)
    private readonly repositoryResolver: OtpRepositoryResolverInterface,
  ) {}

  async cleanup(
    ctx: RepositoryContextInterface,
    options: {
      assigneeId: string;
      category: string;
      keepHistoryDays: number;
    },
  ): Promise<void> {
    const { assigneeId, category, keepHistoryDays } = options;

    const otpRepo = this.repositoryResolver.resolve(ctx.entity);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - keepHistoryDays);

    const oldOtps = await otpRepo.findOlderThan(ctx, {
      assigneeId,
      category,
      cutoffDate,
    });

    if (oldOtps.length > 0) {
      await otpRepo.removeAll(ctx, oldOtps);
    }
  }
}
