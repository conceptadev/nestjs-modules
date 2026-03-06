import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { Otp } from '../../../domain/aggregates/otp';
import { OtpRepositoryResolver } from '../../../infrastructure/persistence/otp-repository.resolver';
import { OtpNotFoundException } from '../../exceptions/otp-not-found.exception';
import { GetOtpQuery } from '../impl/get-otp.query';

@QueryHandler(GetOtpQuery)
export class GetOtpHandler implements IQueryHandler<GetOtpQuery> {
  constructor(private readonly repositoryResolver: OtpRepositoryResolver) {}

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
