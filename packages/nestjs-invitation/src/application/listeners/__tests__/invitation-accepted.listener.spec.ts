import { EventContextHost } from '@concepta/nestjs-common';

import { InvitationEventPayloadInterface } from '../../../domain/events/interfaces/invitation-event-payload.interface';
import { InvitationAcceptedEvent } from '../../../domain/events/invitation-accepted.event';
import { InvitationEmailPort } from '../../../domain/ports/invitation-email.port';
import { InvitationAcceptedListener } from '../invitation-accepted.listener';

describe(InvitationAcceptedListener.name, () => {
  let listener: InvitationAcceptedListener;
  let emailPort: jest.Mocked<Pick<InvitationEmailPort, 'sendAccepted'>>;

  beforeEach(() => {
    emailPort = { sendAccepted: jest.fn().mockResolvedValue(undefined) };
    listener = new InvitationAcceptedListener(
      emailPort as unknown as InvitationEmailPort,
    );
  });

  it('should call emailPort.sendAccepted with the invitation from the event', async () => {
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

    expect(emailPort.sendAccepted).toHaveBeenCalledTimes(1);
    expect(emailPort.sendAccepted).toHaveBeenCalledWith(
      expect.anything(),
      invitation,
    );
  });
});
