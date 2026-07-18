import { mockDeep, type DeepMockProxy } from 'vitest-mock-extended';

import { EventContextHost } from '@concepta/nestjs-core';

import { InvitationRevokedEvent } from '../../../domain/events/invitation-revoked.event.js';
import { type InvitationOtpPort } from '../../../domain/ports/invitation-otp.port.js';
import { InvitationRevokedListener } from '../invitation-revoked.listener.js';

describe(InvitationRevokedListener.name, () => {
  let listener: InvitationRevokedListener;
  let otpPort: DeepMockProxy<InvitationOtpPort>;

  beforeEach(() => {
    otpPort = mockDeep<InvitationOtpPort>();
    listener = new InvitationRevokedListener(otpPort);
  });

  it('should call otpPort.clear with category and userId from event', async () => {
    const eventContext = new EventContextHost({}, {});

    const event = new InvitationRevokedEvent(eventContext, {
      id: 'inv-1',
      code: 'code-1',
      category: 'user',
      userId: 'user-1',
      constraints: undefined,
      dateAccepted: null,
      dateRevoked: new Date(),
      version: 1,
      dateCreated: new Date(),
      dateUpdated: new Date(),
      dateDeleted: null,
    });

    await listener.handle(event);

    expect(otpPort.clear).toHaveBeenCalledTimes(1);
    expect(otpPort.clear).toHaveBeenCalledWith(
      expect.anything(),
      'user',
      'user-1',
    );
  });
});
