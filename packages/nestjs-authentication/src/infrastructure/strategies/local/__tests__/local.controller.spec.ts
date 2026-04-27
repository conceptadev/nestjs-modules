import { randomUUID } from 'crypto';

import { MockProxy, mock } from 'jest-mock-extended';

import { CommandBus } from '@nestjs/cqrs';

import { IssueAuthenticatedResponseCommand } from '../../../../application/commands/impl/issue-authenticated-response.command';
import { AuthenticatedResponseInterface } from '../../../../domain/interfaces/authenticated-response.interface';
import { AuthenticatedUserInterface } from '../../../../domain/interfaces/authenticated-user.interface';

import { LocalControllerFixture } from './fixtures/local.controller.fixture';

describe(LocalControllerFixture, () => {
  const accessToken = 'accessToken';
  const refreshToken = 'refreshToken';
  let controller: LocalControllerFixture;
  let commandBus: MockProxy<CommandBus>;
  const response: AuthenticatedResponseInterface = {
    accessToken,
    refreshToken,
  };

  beforeEach(async () => {
    commandBus = mock<CommandBus>();
    jest.spyOn(commandBus, 'execute').mockResolvedValue(response);
    controller = new LocalControllerFixture(commandBus);
  });

  describe(LocalControllerFixture.prototype.login, () => {
    it('should return user', async () => {
      const user: AuthenticatedUserInterface = {
        id: randomUUID(),
      };
      const result = await controller.login(user);
      expect(result.accessToken).toBe(response.accessToken);
      expect(commandBus.execute).toHaveBeenCalledTimes(1);
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(IssueAuthenticatedResponseCommand),
      );
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({ id: user.id }),
      );
    });
  });
});
