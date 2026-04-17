import { EventContextHost } from '@concepta/nestjs-common';

import { InvitationEventPayloadInterface } from '../../../domain/events/interfaces/invitation-event-payload.interface';
import { InvitationAcceptedEvent } from '../../../domain/events/invitation-accepted.event';
import { InvitationNotificationPort } from '../../../domain/ports/invitation-notification.port';
import { InvitationAcceptedListener } from '../invitation-accepted.listener';

describe(InvitationAcceptedListener.name, () => {
  let listener: InvitationAcceptedListener;
  let notificationPort: jest.Mocked<
    Pick<InvitationNotificationPort, 'sendAccepted'>
  >;

  beforeEach(() => {
    notificationPort = { sendAccepted: jest.fn().mockResolvedValue(undefined) };
    listener = new InvitationAcceptedListener(
      notificationPort as unknown as InvitationNotificationPort,
    );
  });

  it('should call notificationPort.sendAccepted with the invitation from the event', async () => {
    const eventContext = new EventContextHost({}, {});

    const invitation: InvitationEventPayloadInterface = {
      id: 'inv-1',
      code: 'code-1',
      category: 'user',
      userId: 'user-1',
      constraints: undefined,
      dateAccepted: new Date(),
      dateRevoked: null,
      version: 1,
      dateCreated: new Date(),
      dateUpdated: new Date(),
      dateDeleted: null,
    };

    const event = new InvitationAcceptedEvent(eventContext, invitation);

    await listener.handle(event);

    expect(notificationPort.sendAccepted).toHaveBeenCalledTimes(1);
    expect(notificationPort.sendAccepted).toHaveBeenCalledWith(
      expect.anything(),
      invitation,
    );
  });
});
