import {
  ReferenceId,
  RepositoryContextInterface,
  RepositoryInterface,
  Where,
} from '@concepta/nestjs-common';

import { Otp } from '../../domain/aggregates/otp';
import { OtpRepositoryInterface } from '../../domain/repositories/otp-repository.interface';

import { OtpEntityInterface } from './interfaces/otp-entity.interface';
import { OtpMapper } from './otp.mapper';

export class OtpRepository implements OtpRepositoryInterface {
  constructor(
    protected readonly repository: RepositoryInterface<OtpEntityInterface>,
    private readonly mapper: OtpMapper,
  ) {}

  async get(
    ctx: RepositoryContextInterface,
    id: ReferenceId,
  ): Promise<Otp | null> {
    const w = Where.for<OtpEntityInterface>();

    const entity = await this.repository.findOne({
      where: w.eq('id', id),
      ctx,
    });

    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findActiveByPasscode(
    ctx: RepositoryContextInterface,
    options: { category: string; passcode: string },
  ): Promise<Otp | null> {
    const { category, passcode } = options;
    const w = Where.for<OtpEntityInterface>();

    const entity = await this.repository.findOne({
      where: w.and(
        w.eq('category', category),
        w.eq('passcode', passcode),
        w.eq('active', true),
      ),
      ctx,
    });

    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByPasscode(
    ctx: RepositoryContextInterface,
    options: { category: string; passcode: string },
  ): Promise<Otp | null> {
    const { category, passcode } = options;
    const w = Where.for<OtpEntityInterface>();

    const entity = await this.repository.findOne({
      where: w.and(w.eq('category', category), w.eq('passcode', passcode)),
      ctx,
    });

    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findActiveByAssignee(
    ctx: RepositoryContextInterface,
    options: { assigneeId: string; category: string },
  ): Promise<Otp | null> {
    const { assigneeId, category } = options;
    const w = Where.for<OtpEntityInterface>();

    const entity = await this.repository.findOne({
      where: w.and(
        w.eq('assigneeId', assigneeId),
        w.eq('category', category),
        w.eq('active', true),
      ),
      ctx,
    });

    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findAllByAssigneeAndCategory(
    ctx: RepositoryContextInterface,
    options: { assigneeId: string; category: string },
  ): Promise<Otp[]> {
    const { assigneeId, category } = options;
    const w = Where.for<OtpEntityInterface>();

    const entities = await this.repository.find({
      where: w.and(w.eq('assigneeId', assigneeId), w.eq('category', category)),
      ctx,
    });

    return entities.map((e) => this.mapper.toDomain(e));
  }

  async countCreatedSince(
    ctx: RepositoryContextInterface,
    options: { assigneeId: string; category: string; cutoffDate: Date },
  ): Promise<number> {
    const { assigneeId, category, cutoffDate } = options;
    const w = Where.for<OtpEntityInterface>();

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
    const w = Where.for<OtpEntityInterface>();

    const entities = await this.repository.find({
      where: w.and(
        w.eq('assigneeId', assigneeId),
        w.eq('category', category),
        w.lte('dateCreated', cutoffDate),
      ),
      ctx,
    });

    return entities.map((e) => this.mapper.toDomain(e));
  }

  async save(ctx: RepositoryContextInterface, otp: Otp): Promise<void> {
    otp.stampUpdated();
    await this.repository.upsert(this.mapper.toPersistence(otp), { ctx });
  }

  async remove(ctx: RepositoryContextInterface, otp: Otp): Promise<void> {
    await this.repository.delete(this.mapper.toPersistence(otp), { ctx });
  }

  async removeAll(ctx: RepositoryContextInterface, otps: Otp[]): Promise<void> {
    await this.repository.deleteMany(
      otps.map((otp) => this.mapper.toPersistence(otp)),
      { ctx },
    );
  }
}
