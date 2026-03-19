import { Inject } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import {
  EntityHeaderInterface,
  EventContextHost,
} from '@concepta/nestjs-common';
import {
  RepositoryContextInterface,
  TransactionScope,
} from '@concepta/nestjs-repository';

import { Otp } from '../../../domain/aggregates/otp';
import { OtpLimitReachedException } from '../../../domain/exceptions/otp-limit-reached.exception';
import { OtpTypeNotDefinedException } from '../../../domain/exceptions/otp-type-not-defined.exception';
import { OtpRepositoryResolverInterface } from '../../../domain/repositories/otp-repository-resolver.interface';
import { OtpRepositoryInterface } from '../../../domain/repositories/otp-repository.interface';
import { OtpSettingsInterface } from '../../../infrastructure/config/interfaces/otp-settings.interface';
import { OtpCreateDto } from '../../../infrastructure/dtos/otp-create.dto';
import {
  OTP_MODULE_SETTINGS_TOKEN,
  OTP_REPOSITORY_RESOLVER_TOKEN,
} from '../../../otp.constants';
import { validateOtpDto } from '../../utils/validate-otp-dto.util';
import { CreateOtpCommand } from '../impl/create-otp.command';

@CommandHandler(CreateOtpCommand)
export class CreateOtpHandler implements ICommandHandler<CreateOtpCommand> {
  constructor(
    @Inject(OTP_REPOSITORY_RESOLVER_TOKEN)
    private readonly repositoryResolver: OtpRepositoryResolverInterface,
    private readonly txScope: TransactionScope,
    private readonly eventPublisher: EventPublisher,
    @Inject(OTP_MODULE_SETTINGS_TOKEN)
    private readonly settings: OtpSettingsInterface,
  ) {}

  async execute(command: CreateOtpCommand): Promise<Otp> {
    const { ctx, dto, duplicateStrategy, rateSeconds, rateThreshold } = command;

    if (!this.settings.types[dto.type]) {
      throw new OtpTypeNotDefinedException(dto.type);
    }

    const validatedDto = await validateOtpDto(OtpCreateDto, dto);
    const { assigneeId, category, type, expiresIn } = validatedDto;

    const otpRepo = this.repositoryResolver.resolve(ctx.entity);

    const passcode = this.settings.types[dto.type].generator();

    const eventContext = EventContextHost.builder<EntityHeaderInterface>()
      .setHeader('entity', ctx.entity)
      .build();

    return this.txScope.run(ctx, async (trx) => {
      await this.validateRateLimit({
        otpRepo,
        dto: validatedDto,
        ctx,
        rateSeconds,
        rateThreshold,
      });

      const resolvedDuplicateStrategy =
        duplicateStrategy ?? this.settings.duplicateStrategy;

      if (resolvedDuplicateStrategy === 'DEACTIVATE') {
        const activeOtp = await otpRepo.findActiveByAssignee(ctx, {
          assigneeId,
          category,
        });
        if (activeOtp) {
          const mergedActiveOtp =
            this.eventPublisher.mergeObjectContext(activeOtp);
          mergedActiveOtp.deactivate(eventContext);
          await otpRepo.save(ctx, mergedActiveOtp);

          trx.onCommit(ctx, () => mergedActiveOtp.commit());
          trx.onRollback(ctx, () => mergedActiveOtp.uncommit());
        }
      }

      const otp = this.eventPublisher.mergeObjectContext(
        Otp.create(eventContext, {
          category,
          type,
          assigneeId,
          passcode,
          expiresIn,
        }),
      );

      await otpRepo.save(ctx, otp);

      trx.onCommit(ctx, () => otp.commit());
      trx.onRollback(ctx, () => otp.uncommit());

      return otp;
    });
  }

  protected async validateRateLimit(params: {
    otpRepo: OtpRepositoryInterface;
    dto: OtpCreateDto;
    ctx: RepositoryContextInterface;
    rateSeconds?: number;
    rateThreshold?: number;
  }): Promise<void> {
    const { otpRepo, dto, ctx, rateSeconds, rateThreshold } = params;

    const finalRateSeconds =
      rateSeconds !== undefined ? rateSeconds : this.settings.rateSeconds;
    const finalRateThreshold =
      rateThreshold !== undefined ? rateThreshold : this.settings.rateThreshold;

    if (finalRateSeconds && finalRateThreshold) {
      const cutoffDate = new Date();
      cutoffDate.setSeconds(cutoffDate.getSeconds() - finalRateSeconds);

      const recentCount = await otpRepo.countCreatedSince(ctx, {
        assigneeId: dto.assigneeId,
        category: dto.category,
        cutoffDate,
      });

      if (recentCount >= finalRateThreshold) {
        throw new OtpLimitReachedException();
      }
    }
  }
}
