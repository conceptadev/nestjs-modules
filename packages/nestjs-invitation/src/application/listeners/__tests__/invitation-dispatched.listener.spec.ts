import {
  EntityHeaderInterface,
  EventContextHost,
} from '@concepta/nestjs-common';

import { InvitationDispatchedMetadataInterface } from '../../../domain/events/interfaces/invitation-dispatched-metadata.interface';
import { InvitationEventPayloadInterface } from '../../../domain/events/interfaces/invitation-event-payload.interface';
import { InvitationDispatchedEvent } from '../../../domain/events/invitation-dispatched.event';
import { InvitationEmailPort } from '../../../domain/ports/invitation-email.port';
import { InvitationDispatchedListener } from '../invitation-dispatched.listener';

describe(InvitationDispatchedListener.name, () => {
  let listener: InvitationDispatchedListener;
  let emailPort: jest.Mocked<Pick<InvitationEmailPort, 'sendInvitation'>>;

  beforeEach(() => {
    emailPort = { sendInvitation: jest.fn().mockResolvedValue(undefined) };
    listener = new InvitationDispatchedListener(
      emailPort as unknown as InvitationEmailPort,
    );
  });

  it('should call emailPort.sendInvitation with invitation and OTP data from meta', async () => {
    const tokenExp = new Date('2026-02-01');

    const eventContext = EventContextHost.builder<
      EntityHeaderInterface,
      InvitationDispatchedMetadataInterface
    >()
      .setHeader('entity', 'invitation')
      .mergeMeta({ passcode: 'abc123', tokenExp })
      .build();

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

    expect(emailPort.sendInvitation).toHaveBeenCalledTimes(1);
    expect(emailPort.sendInvitation).toHaveBeenCalledWith(
      expect.anything(),
      invitation,
      { passcode: 'abc123', tokenExp },
    );
  });
});
