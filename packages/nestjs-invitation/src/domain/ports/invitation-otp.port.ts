import { Injectable, PlainLiteralObject, Type } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import {
  AssigneeRelationInterface,
  OtpCreatableInterface,
  OtpInterface,
  ReferenceId,
} from '@concepta/nestjs-common';
import { TransactionScope } from '@concepta/nestjs-repository';

import { InvitationOtpPolicy } from '../policies/invitation-otp.policy';

export interface CreateOtpCommandInterface {
  ctx: PlainLiteralObject;
  namespace: string;
  dto: OtpCreatableInterface;
}

export interface ConsumeOtpCommandInterface {
  ctx: PlainLiteralObject;
  namespace: string;
  otp: Pick<OtpInterface, 'category' | 'passcode'>;
}

export interface ClearOtpsCommandInterface {
  ctx: PlainLiteralObject;
  namespace: string;
  otp: Pick<OtpInterface, 'assigneeId' | 'category'>;
}

export interface ValidateOtpQueryInterface {
  ctx: PlainLiteralObject;
  namespace: string;
  otp: Pick<OtpInterface, 'category' | 'passcode'>;
}

export interface InvitationOtpPortSettings {
  createCommand: Type<CreateOtpCommandInterface>;
  consumeCommand: Type<ConsumeOtpCommandInterface>;
  clearCommand: Type<ClearOtpsCommandInterface>;
  validateQuery: Type<ValidateOtpQueryInterface>;
}

@Injectable()
export class InvitationOtpPort {
  constructor(
    private readonly portSettings: InvitationOtpPortSettings,
    private readonly policy: InvitationOtpPolicy,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly txScope: TransactionScope,
  ) {}

  async create(
    ctx: PlainLiteralObject,
    category: string,
    assigneeId: ReferenceId,
  ): Promise<OtpInterface> {
    return this.txScope.run(ctx, async () => {
      const { type, expiresIn, namespace, rateSeconds, rateThreshold } =
        this.policy;

      const dto: OtpCreatableInterface = {
        category,
        type,
        assigneeId,
        expiresIn,
      };

      if (this.policy.clearOtpOnCreate) {
        await this.clear(ctx, category, assigneeId);
      }

      return this.commandBus.execute(
        new this.portSettings.createCommand(ctx, namespace, dto, {
          rateSeconds,
          rateThreshold,
        }),
      );
    });
  }

  async consume(
    ctx: PlainLiteralObject,
    category: string,
    passcode: string,
  ): Promise<AssigneeRelationInterface | null> {
    const { namespace } = this.policy;
    return this.commandBus.execute(
      new this.portSettings.consumeCommand(ctx, namespace, {
        category,
        passcode,
      }),
    );
  }

  async clear(
    ctx: PlainLiteralObject,
    category: string,
    assigneeId: ReferenceId,
  ): Promise<void> {
    const { namespace } = this.policy;
    return this.commandBus.execute(
      new this.portSettings.clearCommand(ctx, namespace, {
        assigneeId,
        category,
      }),
    );
  }

  async validate(
    ctx: PlainLiteralObject,
    category: string,
    passcode: string,
  ): Promise<AssigneeRelationInterface | null> {
    const { namespace } = this.policy;
    return this.queryBus.execute(
      new this.portSettings.validateQuery(ctx, namespace, {
        category,
        passcode,
      }),
    );
  }
}
