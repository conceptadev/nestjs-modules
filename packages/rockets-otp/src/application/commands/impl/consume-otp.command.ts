import { PlainLiteralObject } from '@nestjs/common';
import { Command } from '@nestjs/cqrs';

import { AssigneeRelationInterface } from '@concepta/rockets-app';

import { OtpInterface } from '../../../domain/interfaces/otp.interface';

export class ConsumeOtpCommand extends Command<AssigneeRelationInterface | null> {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly namespace: string,
    public readonly otp: Pick<OtpInterface, 'category' | 'passcode'>,
  ) {
    super();
  }
}
