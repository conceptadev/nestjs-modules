import { randomUUID } from 'crypto';

import { mock } from 'jest-mock-extended';

import { CommandBus } from '@nestjs/cqrs';

import { AuthenticatedResponseInterface } from '../../../../domain/interfaces/authenticated-response.interface';
import { AuthenticatedUserInterface } from '../../../../domain/interfaces/authenticated-user.interface';

import { RefreshControllerFixture } from './fixtures/refresh.controller.fixture';

describe(RefreshControllerFixture, () => {
  const accessToken = 'accessToken';
  const refreshToken = 'refreshToken';
  let controller: RefreshControllerFixture;
  const response: AuthenticatedResponseInterface = {
    accessToken,
    refreshToken,
  };

  beforeEach(async () => {
    const commandBus = mock<CommandBus>();
    jest.spyOn(commandBus, 'execute').mockResolvedValue(response);
    controller = new RefreshControllerFixture(commandBus);
  });

  describe(RefreshControllerFixture.prototype.refresh, () => {
    it('should return user', async () => {
      const user: AuthenticatedUserInterface = {
        id: randomUUID(),
      };
      const result = await controller.refresh(user);
      expect(result.accessToken).toBe(response.accessToken);
    });
  });
});
