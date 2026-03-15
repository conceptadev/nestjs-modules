import {
  OtpInterface,
  ReferenceId,
  RepositoryContextInterface,
  RepositoryInterface,
  Where,
} from '@concepta/nestjs-common';

import { Otp } from '../../domain/aggregates/otp';
import { OtpRepositoryInterface } from '../../domain/repositories/otp-repository.interface';
import { OtpSettingsInterface } from '../config/interfaces/otp-settings.interface';

export class OtpRepository implements OtpRepositoryInterface {
  constructor(
    protected readonly repository: RepositoryInterface<OtpInterface>,
    protected readonly settings: OtpSettingsInterface,
  ) {}

  async get(
    ctx: RepositoryContextInterface,
    id: ReferenceId,
  ): Promise<Otp | null> {
    const w = Where.for<OtpInterface>();

    const entity = await this.repository.findOne({
      where: w.eq('id', id),
      ctx,
    });

    return entity ? Otp.toInstance(entity) : null;
  }

  async findActiveByPasscode(
    ctx: RepositoryContextInterface,
    options: { category: string; passcode: string },
  ): Promise<Otp | null> {
    const { category, passcode } = options;
    const w = Where.for<OtpInterface>();

    const entity = await this.repository.findOne({
      where: w.and(
        w.eq('category', category),
        w.eq('passcode', passcode),
        w.eq('active', true),
      ),
      ctx,
    });

    return entity ? Otp.toInstance(entity) : null;
  }

  async findByPasscode(
    ctx: RepositoryContextInterface,
    options: { category: string; passcode: string },
  ): Promise<Otp | null> {
    const { category, passcode } = options;
    const w = Where.for<OtpInterface>();

    const entity = await this.repository.findOne({
      where: w.and(w.eq('category', category), w.eq('passcode', passcode)),
      ctx,
    });

    return entity ? Otp.toInstance(entity) : null;
  }

  async findActiveByAssignee(
    ctx: RepositoryContextInterface,
    options: { assigneeId: string; category: string },
  ): Promise<Otp | null> {
    const { assigneeId, category } = options;
    const w = Where.for<OtpInterface>();

    const entity = await this.repository.findOne({
      where: w.and(
        w.eq('assigneeId', assigneeId),
        w.eq('category', category),
        w.eq('active', true),
      ),
      ctx,
    });

    return entity ? Otp.toInstance(entity) : null;
  }

  async findAllByAssigneeAndCategory(
    ctx: RepositoryContextInterface,
    options: { assigneeId: string; category: string },
  ): Promise<Otp[]> {
    const { assigneeId, category } = options;
    const w = Where.for<OtpInterface>();

    const entities = await this.repository.find({
      where: w.and(w.eq('assigneeId', assigneeId), w.eq('category', category)),
      ctx,
    });

    return entities.map((e) => Otp.toInstance(e));
  }

  async countCreatedSince(
    ctx: RepositoryContextInterface,
    options: { assigneeId: string; category: string; cutoffDate: Date },
  ): Promise<number> {
    const { assigneeId, category, cutoffDate } = options;
    const w = Where.for<OtpInterface>();

    return this.repository.count({
      where: w.and(
        w.eq('assigneeId', assigneeId),
        w.eq('category', category),
        w.gte('dateCreated', cutoffDate),
      ),
      ctx,
    });
  }

  async findOlderThan(
    ctx: RepositoryContextInterface,
    options: { assigneeId: string; category: string; cutoffDate: Date },
  ): Promise<Otp[]> {
    const { assigneeId, category, cutoffDate } = options;
    const w = Where.for<OtpInterface>();

    const entities = await this.repository.find({
      where: w.and(
        w.eq('assigneeId', assigneeId),
        w.eq('category', category),
        w.lte('dateCreated', cutoffDate),
      ),
      ctx,
    });

    return entities.map((e) => Otp.toInstance(e));
  }

  async save(ctx: RepositoryContextInterface, otp: Otp): Promise<void> {
    const entity = await this.repository.upsert(otp.toPlain(), { ctx });
    otp.hydrate(entity);
  }

  async remove(ctx: RepositoryContextInterface, otp: Otp): Promise<void> {
    await this.repository.delete(otp.toPlain(), { ctx });
  }

  async removeAll(ctx: RepositoryContextInterface, otps: Otp[]): Promise<void> {
    await this.repository.deleteMany(
      otps.map((otp) => otp.toPlain()),
      { ctx },
    );
  }
}
