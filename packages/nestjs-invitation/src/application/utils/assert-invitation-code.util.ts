import { InvitationException } from '../../domain/exceptions/invitation.exception.js';

export function assertInvitationCode(value: unknown): asserts value is string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new InvitationException({
      message: 'Expected invitation code to be a non-empty string, got %s',
      messageParams: [typeof value],
      fault: 'client',
    });
  }
}
