import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { Otp } from '../../../domain/aggregates/otp';
import { OtpRepositoryResolver } from '../../../infrastructure/persistence/otp-repository.resolver';
import { FindAssignedOtpsQuery } from '../impl/find-assigned-otps.query';

@QueryHandler(FindAssignedOtpsQuery)
export class FindAssignedOtpsHandler
  implements IQueryHandler<FindAssignedOtpsQuery>
{
  constructor(private readonly repositoryResolver: OtpRepositoryResolver) {}

  async execute(query: FindAssignedOtpsQuery): Promise<Otp[]> {
    const { ctx, otp } = query;

    const otpRepo = this.repositoryResolver.resolve(ctx.entity);

    return otpRepo.findAllByAssigneeAndCategory(ctx, {
      assigneeId: otp.assigneeId,
      category: otp.category,
    });
  }
}
