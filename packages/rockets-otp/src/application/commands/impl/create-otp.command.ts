import { PlainLiteralObject } from '@nestjs/common';
import { Command } from '@nestjs/cqrs';

import { Otp } from '../../../domain/aggregates/otp';
import { OtpCreatableInterface } from '../../../domain/interfaces/otp-creatable.interface';

interface CreateOtpCommandOptions {
  duplicateStrategy?: 'ALLOW' | 'DEACTIVATE';
  rateSeconds?: number;
  rateThreshold?: number;
}

export class CreateOtpCommand extends Command<Otp> {
  public readonly duplicateStrategy?: CreateOtpCommandOptions['duplicateStrategy'];
  public readonly rateSeconds?: number;
  public readonly rateThreshold?: number;

  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly namespace: string,
    public readonly dto: OtpCreatableInterface,
    options?: CreateOtpCommandOptions,
  ) {
    super();
    this.duplicateStrategy = options?.duplicateStrategy;
    this.rateSeconds = options?.rateSeconds;
    this.rateThreshold = options?.rateThreshold;
  }
}
