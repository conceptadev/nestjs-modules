import { type ReferenceId } from '@concepta/nestjs-core';

import { InvitationException } from '../../domain/exceptions/invitation.exception';

export function assertInvitationId(
  value: unknown,
): asserts value is ReferenceId {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new InvitationException({
      message: 'Expected invitation id to be a non-empty string, got %s',
      messageParams: [typeof value],
    });
  }
}
