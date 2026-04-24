import { randomUUID } from 'crypto';

import { mock } from 'jest-mock-extended';

import { ExecutionContext } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { ReferenceIdInterface } from '@concepta/nestjs-common';

import { JwtUnauthorizedException } from '../exceptions/jwt-unauthorized.exception';
import { JwtGuard } from '../jwt.guard';

import { UserModuleFixture } from './fixtures/user.module.fixture';

describe(JwtGuard, () => {
  let context: ExecutionContext;
  let jwtGuard: JwtGuard;
  let spyCanActivate: jest.SpyInstance;
  let user: ReferenceIdInterface;

  beforeEach(async () => {
    context = mock<ExecutionContext>();

    const moduleRef = await Test.createTestingModule({
      imports: [UserModuleFixture],
    }).compile();
    jwtGuard = moduleRef.get<JwtGuard>(JwtGuard);
    spyCanActivate = jest
      .spyOn(JwtGuard.prototype, 'canActivate')
      .mockImplementation(() => true);
    user = { id: randomUUID() };
  });

  describe(JwtGuard.prototype.canActivate, () => {
    it('should be success', async () => {
      await jwtGuard.canActivate(context);
      expect(spyCanActivate).toHaveBeenCalled();
      expect(spyCanActivate).toHaveBeenCalledWith(context);
    });
  });

  describe(JwtGuard.prototype.handleRequest, () => {
    it('should return user', () => {
      const response = jwtGuard.handleRequest<ReferenceIdInterface>(
        undefined,
        user,
      );
      expect(response?.id).toBe(user.id);
    });
    it('should throw error', () => {
      const error = new Error();
      const t = () => {
        jwtGuard.handleRequest<ReferenceIdInterface>(error, user);
      };
      expect(t).toThrow();
    });
    it('should throw error unauthorized', () => {
      const t = () => {
        jwtGuard.handleRequest(undefined, undefined);
      };
      expect(t).toThrow(JwtUnauthorizedException);
    });
  });
});
