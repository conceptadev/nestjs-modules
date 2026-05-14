import { PlainLiteralObject } from '@nestjs/common';
import { Query } from '@nestjs/cqrs';

import { AssigneeRelationInterface } from '@concepta/rockets-app';

import { OtpInterface } from '../../../domain/interfaces/otp.interface';

export class ValidateOtpQuery extends Query<AssigneeRelationInterface | null> {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly namespace: string,
    public readonly otp: Pick<OtpInterface, 'category' | 'passcode'>,
  ) {
    super();
  }
}
