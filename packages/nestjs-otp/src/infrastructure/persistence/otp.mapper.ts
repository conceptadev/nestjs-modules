import { DomainMapper } from '@concepta/nestjs-common/aggregate';

import { Otp } from '../../domain/aggregates/otp';
import { OtpInterface } from '../../domain/interfaces/otp.interface';

import { OtpEntityInterface } from './interfaces/otp-entity.interface';

export class OtpMapper extends DomainMapper<
  OtpEntityInterface,
  OtpInterface,
  Otp
> {
  createAggregate(entity: OtpEntityInterface): Otp {
    const { id, version, dateCreated, dateUpdated, dateDeleted, ...props } =
      entity;

    return new Otp(id, props, version, {
      dateCreated,
      dateUpdated,
      dateDeleted,
    });
  }
}
