import { ReferenceId } from '@concepta/nestjs-common';
import { RepositoryContextInterface } from '@concepta/nestjs-repository';

import { Otp } from '../aggregates/otp';

export interface OtpRepositoryInterface {
  get(ctx: RepositoryContextInterface, id: ReferenceId): Promise<Otp | null>;

  findActiveByPasscode(
    ctx: RepositoryContextInterface,
    options: { category: string; passcode: string },
  ): Promise<Otp | null>;

  findByPasscode(
    ctx: RepositoryContextInterface,
    options: { category: string; passcode: string },
  ): Promise<Otp | null>;

  findActiveByAssignee(
    ctx: RepositoryContextInterface,
    options: { assigneeId: string; category: string },
  ): Promise<Otp | null>;

  findAllByAssigneeAndCategory(
    ctx: RepositoryContextInterface,
    options: { assigneeId: string; category: string },
  ): Promise<Otp[]>;

  countCreatedSince(
    ctx: RepositoryContextInterface,
    options: { assigneeId: string; category: string; cutoffDate: Date },
  ): Promise<number>;

  findOlderThan(
    ctx: RepositoryContextInterface,
    options: { assigneeId: string; category: string; cutoffDate: Date },
  ): Promise<Otp[]>;

  save(ctx: RepositoryContextInterface, otp: Otp): Promise<void>;

  remove(ctx: RepositoryContextInterface, otp: Otp): Promise<void>;

  removeAll(ctx: RepositoryContextInterface, otps: Otp[]): Promise<void>;
}
