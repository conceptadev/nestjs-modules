import { createMockCommandBus } from '@concepta/nestjs-common/testing';

import { SendInvitationRequest } from '../../impl/send-invitation.request';
import { SendInvitationRequestHandler } from '../send-invitation-request.handler';

describe(SendInvitationRequestHandler.name, () => {
  let commandBus: ReturnType<typeof createMockCommandBus>;
  let handler: SendInvitationRequestHandler;

  beforeEach(() => {
    commandBus = createMockCommandBus();
    handler = new SendInvitationRequestHandler(commandBus as never);
  });

  it('should dispatch SendInvitationCommand with the invitation id', async () => {
    commandBus.execute.mockResolvedValue(undefined);

    const context = {
      entity: 'invitation',
      params: { id: 'test-id' },
    } as never;

    await handler.execute(new SendInvitationRequest(context));

    expect(commandBus.execute).toHaveBeenCalledTimes(1);
  });
});
