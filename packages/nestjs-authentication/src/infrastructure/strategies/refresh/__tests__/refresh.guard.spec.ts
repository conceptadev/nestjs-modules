import { mock } from 'jest-mock-extended';

import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';

import { GuardsPolicy } from '../../../../domain/policies/guards.policy';
import { RefreshUnauthorizedException } from '../exceptions/refresh-unauthorized.exception';
import { REFRESH_STRATEGY_NAME } from '../refresh.constants';
import { RefreshGuard } from '../refresh.guard';

jest.mock('@nestjs/passport', () => ({
  AuthGuard: jest.fn().mockImplementation(() => jest.fn()),
}));

describe(RefreshGuard.name, () => {
  let guard: RefreshGuard;
  let context: ExecutionContext;

  beforeEach(() => {
    context = mock<ExecutionContext>();
    guard = new RefreshGuard(
      new GuardsPolicy({ enable: true }),
      new Reflector(),
    );
  });

  it('should be configured with the refresh passport strategy', () => {
    expect(PassportAuthGuard).toHaveBeenCalledWith(REFRESH_STRATEGY_NAME);
  });

  describe('handleRequest', () => {
    it('should return the user on success', () => {
      const user = { id: 'user-1' };
      expect(guard.handleRequest(undefined, user)).toBe(user);
    });

    it('should throw RefreshUnauthorizedException when an error is provided', () => {
      const err = new Error('token expired');
      expect(() => guard.handleRequest(err, undefined)).toThrow(
        RefreshUnauthorizedException,
      );
    });

    it('should throw RefreshUnauthorizedException when user is undefined', () => {
      expect(() => guard.handleRequest(undefined, undefined)).toThrow(
        RefreshUnauthorizedException,
      );
    });

    it('should throw RefreshUnauthorizedException when user is null', () => {
      expect(() => guard.handleRequest(undefined, null)).toThrow(
        RefreshUnauthorizedException,
      );
    });

    it('should include the info error as originalError when only info is provided', () => {
      const info = new Error('jwt expired');
      let caught: unknown;
      try {
        guard.handleRequest(undefined, undefined, info);
      } catch (e) {
        caught = e;
      }
      expect(caught).toBeInstanceOf(RefreshUnauthorizedException);
      if (caught instanceof RefreshUnauthorizedException) {
        expect(caught.context.originalError).toBe(info);
      }
    });
  });

  describe('canActivate', () => {
    it('should delegate to the passport canActivate', () => {
      const spy = jest
        .spyOn(RefreshGuard.prototype, 'canActivate')
        .mockReturnValue(true);

      const result = guard.canActivate(context);

      expect(spy).toHaveBeenCalledWith(context);
      expect(result).toBe(true);
    });
  });
});
