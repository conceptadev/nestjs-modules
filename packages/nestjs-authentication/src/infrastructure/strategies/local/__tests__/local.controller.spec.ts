import { randomUUID } from 'crypto';

import { mock } from 'jest-mock-extended';

import { CommandBus } from '@nestjs/cqrs';

import { AuthenticatedResponseInterface } from '../../../../domain/interfaces/authenticated-response.interface';
import { AuthenticatedUserInterface } from '../../../../domain/interfaces/authenticated-user.interface';

import { LocalControllerFixture } from './fixtures/local.controller.fixture';

describe(LocalControllerFixture, () => {
  const accessToken = 'accessToken';
  const refreshToken = 'refreshToken';
  let controller: LocalControllerFixture;
  const response: AuthenticatedResponseInterface = {
    accessToken,
    refreshToken,
  };

  beforeEach(async () => {
    const commandBus = mock<CommandBus>();
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
    });
  });
});
