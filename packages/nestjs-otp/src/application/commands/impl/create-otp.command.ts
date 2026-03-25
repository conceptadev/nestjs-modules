import { PlainLiteralObject } from '@nestjs/common';

import { OtpCreatableInterface } from '@concepta/nestjs-common';

interface CreateOtpCommandOptions {
  duplicateStrategy?: 'ALLOW' | 'DEACTIVATE';
  rateSeconds?: number;
  rateThreshold?: number;
}

export class CreateOtpCommand {
  public readonly duplicateStrategy?: CreateOtpCommandOptions['duplicateStrategy'];
  public readonly rateSeconds?: number;
  public readonly rateThreshold?: number;

  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly namespace: string,
    public readonly dto: OtpCreatableInterface,
    options?: CreateOtpCommandOptions,
  ) {
    this.duplicateStrategy = options?.duplicateStrategy;
    this.rateSeconds = options?.rateSeconds;
    this.rateThreshold = options?.rateThreshold;
  }
}
