import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TransactionScope } from '@concepta/nestjs-repository';

import { OtpRepositoryResolver } from '../../../infrastructure/persistence/otp-repository.resolver';
import { RemoveOtpCommand } from '../impl/remove-otp.command';

@CommandHandler(RemoveOtpCommand)
export class RemoveOtpHandler implements ICommandHandler<RemoveOtpCommand> {
  constructor(
    private readonly repositoryResolver: OtpRepositoryResolver,
    private readonly txScope: TransactionScope,
  ) {}

  async execute(command: RemoveOtpCommand): Promise<void> {
    const { ctx, otp } = command;

    const otpRepo = this.repositoryResolver.resolve(ctx.entity);

    return this.txScope.run(ctx, async () => {
      const found = await otpRepo.findByPasscode(ctx, {
        category: otp.category,
        passcode: otp.passcode,
      });

      if (found) {
        await otpRepo.remove(ctx, found);
      }
    });
  }
}
