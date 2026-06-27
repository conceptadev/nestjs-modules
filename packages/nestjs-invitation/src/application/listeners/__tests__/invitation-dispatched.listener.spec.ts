import { mockDeep, type DeepMockProxy } from 'jest-mock-extended';

import { EventContextHost } from '@concepta/nestjs-core';

import { type InvitationEventPayloadInterface } from '../../../domain/events/interfaces/invitation-event-payload.interface';
import { InvitationDispatchedEvent } from '../../../domain/events/invitation-dispatched.event';
import { type InvitationNotificationPort } from '../../../domain/ports/invitation-notification.port';
import { InvitationDispatchedListener } from '../invitation-dispatched.listener';

describe(InvitationDispatchedListener.name, () => {
  let listener: InvitationDispatchedListener;
  let notificationPort: DeepMockProxy<InvitationNotificationPort>;

  beforeEach(() => {
    notificationPort = mockDeep<InvitationNotificationPort>();
    listener = new InvitationDispatchedListener(notificationPort);
  });

  it('should call notificationPort.sendInvitation with invitation and OTP data from meta', async () => {
    const tokenExp = new Date('2026-02-01');

    const eventContext = new EventContextHost(
      {},
      { passcode: 'abc123', tokenExp },
    );

    const invitation: InvitationEventPayloadInterface = {
      id: 'inv-1',
      code: 'code-1',
      category: 'user',
      userId: 'user-1',
      constraints: undefined,
      dateAccepted: null,
      dateRevoked: null,
      version: 1,
      dateCreated: new Date(),
      dateUpdated: new Date(),
      dateDeleted: null,
    };

    const event = new InvitationDispatchedEvent(eventContext, invitation);

    await listener.handle(event);

    expect(notificationPort.sendInvitation).toHaveBeenCalledTimes(1);
    expect(notificationPort.sendInvitation).toHaveBeenCalledWith(
      expect.anything(),
      invitation,
      { passcode: 'abc123', tokenExp },
    );
  });
});
