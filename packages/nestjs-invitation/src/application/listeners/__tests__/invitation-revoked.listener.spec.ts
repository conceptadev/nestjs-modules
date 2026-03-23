import {
  EntityHeaderInterface,
  EventContextHost,
} from '@concepta/nestjs-common';

import { InvitationRevokedEvent } from '../../../domain/events/invitation-revoked.event';
import { InvitationOtpPort } from '../../../domain/ports/invitation-otp.port';
import { InvitationRevokedListener } from '../invitation-revoked.listener';

describe(InvitationRevokedListener.name, () => {
  let listener: InvitationRevokedListener;
  let otpPort: jest.Mocked<Pick<InvitationOtpPort, 'clear'>>;

  beforeEach(() => {
    otpPort = { clear: jest.fn().mockResolvedValue(undefined) };
    listener = new InvitationRevokedListener(
      otpPort as unknown as InvitationOtpPort,
    );
  });

  it('should call otpPort.clear with category and userId from event', async () => {
    const eventContext = EventContextHost.builder<EntityHeaderInterface>()
      .setHeader('entity', 'invitation')
      .build();

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
