import { Injectable } from '@nestjs/common';

import { RepositoryContextInterface } from '@concepta/nestjs-common';

import { OtpRepositoryResolver } from '../../infrastructure/persistence/otp-repository.resolver';

@Injectable()
export class OtpHistoryCleanupService {
  constructor(private readonly repositoryResolver: OtpRepositoryResolver) {}

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
