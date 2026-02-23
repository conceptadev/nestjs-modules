import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TransactionScope } from '@concepta/nestjs-repository';

import { OtpRepositoryResolver } from '../../../infrastructure/persistence/otp-repository.resolver';
import { ClearOtpsCommand } from '../impl/clear-otps.command';

@CommandHandler(ClearOtpsCommand)
export class ClearOtpsHandler implements ICommandHandler<ClearOtpsCommand> {
  constructor(
    private readonly repositoryResolver: OtpRepositoryResolver,
    private readonly txScope: TransactionScope,
  ) {}

  async execute(command: ClearOtpsCommand): Promise<void> {
    const { ctx, otp } = command;

    const otpRepo = this.repositoryResolver.resolve(ctx.entity);

    return this.txScope.run(ctx, async () => {
      const otps = await otpRepo.findAllByAssigneeAndCategory(ctx, {
        assigneeId: otp.assigneeId,
        category: otp.category,
      });

      if (otps.length > 0) {
        await otpRepo.removeAll(ctx, otps);
      }
    });
  }
}
