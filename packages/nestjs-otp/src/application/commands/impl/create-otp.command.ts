import { OtpCreatableInterface } from '@concepta/nestjs-common';
import { RepositoryContextInterface } from '@concepta/nestjs-repository';

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
    public readonly ctx: RepositoryContextInterface,
    public readonly dto: OtpCreatableInterface,
    options?: CreateOtpCommandOptions,
  ) {
    this.duplicateStrategy = options?.duplicateStrategy;
    this.rateSeconds = options?.rateSeconds;
    this.rateThreshold = options?.rateThreshold;
  }
}
