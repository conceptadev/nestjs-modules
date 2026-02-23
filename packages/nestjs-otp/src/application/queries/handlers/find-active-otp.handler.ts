import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { Otp } from '../../../domain/aggregates/otp';
import { OtpRepositoryResolver } from '../../../infrastructure/persistence/otp-repository.resolver';
import { FindActiveOtpQuery } from '../impl/find-active-otp.query';

@QueryHandler(FindActiveOtpQuery)
export class FindActiveOtpHandler implements IQueryHandler<FindActiveOtpQuery> {
  constructor(private readonly repositoryResolver: OtpRepositoryResolver) {}

  async execute(query: FindActiveOtpQuery): Promise<Otp | null> {
    const { ctx, otp } = query;

    const otpRepo = this.repositoryResolver.resolve(ctx.entity);

    return otpRepo.findActiveByPasscode(ctx, {
      category: otp.category,
      passcode: otp.passcode,
    });
  }
}
