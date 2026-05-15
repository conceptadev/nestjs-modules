import { mock } from 'jest-mock-extended';

import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';

import { GuardsPolicy } from '../../domain/policies/guards.policy';
import { AuthGuard } from '../auth.guard';

jest.mock('@nestjs/passport', () => ({
  AuthGuard: jest.fn().mockImplementation(() => jest.fn()),
}));

describe(AuthGuard.name, () => {
  let reflector: Reflector;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    reflector = new Reflector();
    mockContext = mock<ExecutionContext>();
  });

  it('should use PassportAuthGuard for Express', () => {
    AuthGuard('local');
    expect(PassportAuthGuard).toHaveBeenCalledWith('local');
  });

  it('should always activate if guards are disabled globally', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    const Guard = AuthGuard('local', { canDisable: true });
    const guardInstance = new Guard(
      new GuardsPolicy({ enable: false }),
      reflector,
    );
    expect(guardInstance.canActivate(mockContext)).toBeTruthy();
  });

  it('should respect disable callback', () => {
    const Guard = AuthGuard('local', { canDisable: true });
    const guardInstance = new Guard(
      new GuardsPolicy({ enable: false }),
      reflector,
    );
    expect(guardInstance.canActivate(mockContext)).toBeTruthy();
  });

  it('should respect enable guard and disabled from reflector callback', () => {
    jest
      .spyOn(reflector, 'get')
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(undefined);
    const Guard = AuthGuard('local', { canDisable: true });
    const guardInstance = new Guard(
      new GuardsPolicy({ enable: true }),
      reflector,
    );
    expect(guardInstance.canActivate(mockContext)).toBeTruthy();
  });

  it('should respect guards.disable callback', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(undefined);
    const Guard = AuthGuard('local', { canDisable: true });
    const guardInstance = new Guard(
      new GuardsPolicy({ enable: true, disable: () => true }),
      reflector,
    );
    expect(guardInstance.canActivate(mockContext)).toBeTruthy();
  });
});
