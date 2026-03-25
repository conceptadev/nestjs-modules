import { randomUUID } from 'crypto';

import { Inject, Injectable, PlainLiteralObject } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';

import { EventContextHost, ReferenceId } from '@concepta/nestjs-common';
import { TransactionScope } from '@concepta/nestjs-repository';

import { InvitationNotFoundException } from '../../application/exceptions/invitation-not-found.exception';
import { InvitationUserUndefinedException } from '../../application/exceptions/invitation-user-undefined.exception';
import { INVITATION_MODULE_REPOSITORY_TOKEN } from '../../invitation.constants';
import { Invitation } from '../aggregates/invitation';
import { InvitationDispatchedMetadataInterface } from '../events/interfaces/invitation-dispatched-metadata.interface';
import { InvitationException } from '../exceptions/invitation.exception';
import { InvitationCreatableByEmailInterface } from '../interfaces/invitation-creatable-by-email.interface';
import { InvitationCreatableInterface } from '../interfaces/invitation-creatable.interface';
import { InvitationOtpPort } from '../ports/invitation-otp.port';
import { InvitationUserPort } from '../ports/invitation-user.port';
import { InvitationRepositoryInterface } from '../repositories/invitation-repository.interface';

@Injectable()
export class InvitationService {
  constructor(
    @Inject(INVITATION_MODULE_REPOSITORY_TOKEN)
    private readonly invitationRepo: InvitationRepositoryInterface,
    private readonly txScope: TransactionScope,
    private readonly eventPublisher: EventPublisher,
    private readonly otpPort: InvitationOtpPort,
    private readonly userPort: InvitationUserPort,
  ) {}

  async create(
    ctx: PlainLiteralObject,
    dto: InvitationCreatableInterface,
  ): Promise<Invitation> {
    return this.txScope.run(ctx, async (trx) => {
      const eventContext = new EventContextHost({}, {});

      const invitation = this.eventPublisher.mergeObjectContext(
        Invitation.create(eventContext, dto),
      );

      await this.invitationRepo.save(ctx, invitation);

      await this.send(ctx, invitation);

      trx.onCommit(ctx, () => invitation.commit());
      trx.onRollback(ctx, () => invitation.uncommit());

      return invitation;
    });
  }

  async createByEmail(
    ctx: PlainLiteralObject,
    dto: InvitationCreatableByEmailInterface,
  ): Promise<Invitation> {
    return this.txScope.run(ctx, async () => {
      const { email, category, constraints } = dto;

      const user = await this.userPort.getByEmail(ctx, email);

      if (!user) {
        throw new InvitationUserUndefinedException();
      }

      return this.create(ctx, {
        userId: user.id,
        code: randomUUID(),
        category,
        constraints,
      });
    });
  }

  async send(
    ctx: PlainLiteralObject,
    invitation: Invitation,
  ): Promise<void> {
    return this.txScope.run(ctx, async (trx) => {
      const { category, userId } = invitation;

      const user = await this.userPort.getById(ctx, userId);

      if (!user) {
        throw new InvitationUserUndefinedException();
      }

      const otp = await this.otpPort.create(ctx, category, userId);

      const eventContext = new EventContextHost<
        PlainLiteralObject,
        InvitationDispatchedMetadataInterface
      >({}, {
        passcode: otp.passcode,
        tokenExp: otp.expirationDate,
      });

      const merged = this.eventPublisher.mergeObjectContext(invitation);
      merged.dispatch(eventContext);

      trx.onCommit(ctx, () => merged.commit());
      trx.onRollback(ctx, () => merged.uncommit());
    });
  }

  async sendById(
    ctx: PlainLiteralObject,
    invitationId: ReferenceId,
  ): Promise<void> {
    const invitation = await this.invitationRepo.get(ctx, invitationId);

    if (!invitation) {
      throw new InvitationNotFoundException(invitationId);
    }

    await this.send(ctx, invitation);
  }

  async accept(
    ctx: PlainLiteralObject,
    code: string,
    passcode: string,
    payload?: PlainLiteralObject,
  ): Promise<Invitation | null> {
    return this.txScope.run(ctx, async (trx) => {
      let invitation;

      try {
        invitation = await this.invitationRepo.findOneByCode(ctx, code);
      } catch (e: unknown) {
        throw new InvitationException({ originalError: e });
      }

      if (!invitation) {
        throw new InvitationNotFoundException(
          code,
          'Invitation not found for code=%s',
        );
      }

      const { category } = invitation;

      const otp = await this.otpPort.consume(ctx, category, passcode);

      if (!otp) {
        return null;
      }

      const eventContext = new EventContextHost({}, {});

      const merged = this.eventPublisher.mergeObjectContext(invitation);
      merged.accept(eventContext, payload);

      await this.invitationRepo.save(ctx, merged);

      // revoke all other active invitations for this user+category
      await this.revokeByUserId(ctx, invitation.userId, category);

      trx.onCommit(ctx, () => merged.commit());
      trx.onRollback(ctx, () => merged.uncommit());

      return merged;
    });
  }

  async remove(
    ctx: PlainLiteralObject,
    id: ReferenceId,
  ): Promise<Invitation> {
    return this.txScope.run(ctx, async (trx) => {
      const invitation = await this.invitationRepo.get(ctx, id);

      if (!invitation) {
        throw new InvitationNotFoundException(String(id));
      }

      const eventContext = new EventContextHost({}, {});

      const merged = this.eventPublisher.mergeObjectContext(invitation);
      merged.remove(eventContext);

      await this.invitationRepo.remove(ctx, merged);

      trx.onCommit(ctx, () => merged.commit());
      trx.onRollback(ctx, () => merged.uncommit());

      return merged;
    });
  }

  async revokeByEmail(
    ctx: PlainLiteralObject,
    email: string,
    category: string,
  ): Promise<void> {
    const user = await this.userPort.getByEmail(ctx, email);

    if (!user) {
      throw new InvitationUserUndefinedException();
    }

    await this.revokeByUserId(ctx, user.id, category);
  }

  async revokeByUserId(
    ctx: PlainLiteralObject,
    userId: ReferenceId,
    category: string,
  ): Promise<void> {
    const invitations = await this.invitationRepo.findAllByUserAndCategory(
      ctx,
      userId,
      category,
    );

    const activeInvitations = invitations.filter((inv) => inv.active);

    if (activeInvitations.length === 0) {
      return;
    }

    const eventContext = new EventContextHost({}, {});

    await this.revokeActive(ctx, eventContext, activeInvitations);
  }

  protected async revokeActive(
    ctx: PlainLiteralObject,
    eventContext: EventContextHost,
    invitations: Invitation[],
  ): Promise<void> {
    return this.txScope.run(ctx, async (trx) => {
      for (const invitation of invitations) {
        const merged = this.eventPublisher.mergeObjectContext(invitation);
        merged.revoke(eventContext);
        await this.invitationRepo.save(ctx, merged);
        trx.onCommit(ctx, () => merged.commit());
        trx.onRollback(ctx, () => merged.uncommit());
      }
    });
  }
}
