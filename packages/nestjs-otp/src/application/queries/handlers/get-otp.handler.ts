import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { Otp } from '../../../domain/aggregates/otp';
import { OtpRepositoryResolverInterface } from '../../../domain/repositories/otp-repository-resolver.interface';
import { OTP_REPOSITORY_RESOLVER_TOKEN } from '../../../otp.constants';
import { OtpNotFoundException } from '../../exceptions/otp-not-found.exception';
import { GetOtpQuery } from '../impl/get-otp.query';

@QueryHandler(GetOtpQuery)
export class GetOtpHandler implements IQueryHandler<GetOtpQuery> {
  constructor(
    @Inject(OTP_REPOSITORY_RESOLVER_TOKEN)
    private readonly repositoryResolver: OtpRepositoryResolverInterface,
  ) {}

  async execute(query: GetOtpQuery): Promise<Otp> {
    const { ctx, id } = query;

    const otpRepo = this.repositoryResolver.resolve(ctx.entity);

    const otp = await otpRepo.get(ctx, id);

    if (!otp) {
      throw new OtpNotFoundException({ id });
    }

    return otp;
  }
}
