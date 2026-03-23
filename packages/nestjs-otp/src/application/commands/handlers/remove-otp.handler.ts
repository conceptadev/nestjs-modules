import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TransactionScope } from '@concepta/nestjs-repository';

import { OtpRepositoryResolverInterface } from '../../../domain/repositories/otp-repository-resolver.interface';
import { OTP_REPOSITORY_RESOLVER_TOKEN } from '../../../otp.constants';
import { RemoveOtpCommand } from '../impl/remove-otp.command';

@CommandHandler(RemoveOtpCommand)
export class RemoveOtpHandler implements ICommandHandler<RemoveOtpCommand> {
  constructor(
    @Inject(OTP_REPOSITORY_RESOLVER_TOKEN)
    private readonly repositoryResolver: OtpRepositoryResolverInterface,
    private readonly txScope: TransactionScope,
  ) {}

  async execute(command: RemoveOtpCommand): Promise<void> {
    const { ctx, namespace, otp } = command;

    const otpRepo = this.repositoryResolver.resolve(namespace);

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
