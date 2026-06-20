import { createMockCommandBus } from '@concepta/nestjs-core/testing';

import {
  createMockInvitationEntity,
  toInvitationDomain,
} from '../../../../../__tests__/helpers/mock.helpers';
import { InvitationAcceptableInterface } from '../../../../../domain/interfaces/invitation-acceptable.interface';
import { InvitationNotAcceptedException } from '../../../../exceptions/invitation-not-accepted.exception';
import { AcceptInvitationRequest } from '../../impl/accept-invitation.request';
import { AcceptInvitationRequestHandler } from '../accept-invitation-request.handler';

describe(AcceptInvitationRequestHandler.name, () => {
  let commandBus: ReturnType<typeof createMockCommandBus>;
  let handler: AcceptInvitationRequestHandler;

  beforeEach(() => {
    commandBus = createMockCommandBus();
    handler = new AcceptInvitationRequestHandler(commandBus as never);
  });

  it('should not throw when acceptance succeeds', async () => {
    const invitation = toInvitationDomain(createMockInvitationEntity());
    commandBus.execute.mockResolvedValue(invitation);

    const context = {
      entity: 'invitation',
      params: { code: 'test-code' },
    } as never;
    const dto: InvitationAcceptableInterface = {
      passcode: 'test-passcode',
      payload: { newPassword: 'secret123' },
    };

    await expect(
      handler.execute(new AcceptInvitationRequest(context, dto)),
    ).resolves.not.toThrow();

    expect(commandBus.execute).toHaveBeenCalledTimes(1);
  });

  it('should throw InvitationNotAcceptedException when acceptance returns null', async () => {
    commandBus.execute.mockResolvedValue(null);

    const context = {
      entity: 'invitation',
      params: { code: 'test-code' },
    } as never;
    const dto: InvitationAcceptableInterface = {
      passcode: 'wrong-passcode',
    };

    await expect(
      handler.execute(new AcceptInvitationRequest(context, dto)),
    ).rejects.toThrow(InvitationNotAcceptedException);
  });

  it('should throw InvitationNotAcceptedException with originalError when command throws', async () => {
    const originalError = new Error('domain error');
    commandBus.execute.mockRejectedValue(originalError);

    const context = {
      entity: 'invitation',
      params: { code: 'test-code' },
    } as never;
    const dto: InvitationAcceptableInterface = {
      passcode: 'test-passcode',
    };

    await expect(
      handler.execute(new AcceptInvitationRequest(context, dto)),
    ).rejects.toThrow(InvitationNotAcceptedException);
  });
});
