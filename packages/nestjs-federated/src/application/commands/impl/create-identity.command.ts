import { PlainLiteralObject } from '@nestjs/common';
import { Command } from '@nestjs/cqrs';

import { Identity } from '../../../domain/aggregates/identity';
import { IdentityCreatableInterface } from '../../../domain/interfaces/identity-creatable.interface';

export class CreateIdentityCommand extends Command<Identity> {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly dto: IdentityCreatableInterface,
  ) {
    super();
  }
}
