import {
  createMockCommandBus,
  createMockInvitationEntity,
  toInvitationDomain,
} from '../../../../../__tests__/helpers/mock.helpers';
import { CreateInvitationByEmailCommand } from '../../../../../application/commands/impl/create-invitation-by-email.command';
import { CreateInvitationByEmailRequest } from '../../impl/create-invitation-by-email.request';
import { CreateInvitationByEmailRequestHandler } from '../create-invitation-by-email-request.handler';

describe(CreateInvitationByEmailRequestHandler.name, () => {
  let commandBus: ReturnType<typeof createMockCommandBus>;
  let handler: CreateInvitationByEmailRequestHandler;

  beforeEach(() => {
    commandBus = createMockCommandBus();
    handler = new CreateInvitationByEmailRequestHandler(commandBus as never);
  });

  it('should return a plain object from toPlain()', async () => {
    const entity = createMockInvitationEntity();
    commandBus.execute.mockResolvedValue(toInvitationDomain(entity));

    const context = { entity: 'invitation' } as never;
    const dto = {
      email: 'test@example.com',
      category: 'user',
      constraints: { role: 'admin' },
    };

    const result = await handler.execute(
      new CreateInvitationByEmailRequest(context, dto),
    );

    expect(result.id).toBe('test-id');
    expect(result.code).toBe('test-code');
    expect(commandBus.execute).toHaveBeenCalledTimes(1);
    expect(commandBus.execute).toHaveBeenCalledWith(
      expect.any(CreateInvitationByEmailCommand),
    );
  });
});
