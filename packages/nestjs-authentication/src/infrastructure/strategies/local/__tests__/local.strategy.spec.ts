import { randomUUID } from 'crypto';

import * as classValidator from 'class-validator';
import { mock } from 'jest-mock-extended';

import { BadRequestException, HttpStatus } from '@nestjs/common';

import { type ReferenceIdInterface } from '@concepta/nestjs-core';

import { type LocalServiceInterface } from '../../../../application/services/local/interfaces/local-service.interface';
import { type LocalValidateUserInterface } from '../../../../application/services/local/interfaces/local-validate-user.interface';
import { LocalService } from '../../../../application/services/local/local.service';
import { LocalStrategyPolicy } from '../../../../domain/policies/local-strategy.policy';
import { type PasswordPort } from '../../../../domain/ports/password.port';
import {
  type AuthenticationUserResult,
  type UserPort,
} from '../../../../domain/ports/user.port';
import { LocalLoginDto } from '../dto/local-login.dto';
import { LocalInvalidCredentialsException } from '../exceptions/local-invalid-credentials.exception';
import { LocalInvalidLoginDataException } from '../exceptions/local-invalid-login-data.exception';
import { LocalException } from '../exceptions/local.exception';
import { LocalStrategy } from '../local.strategy';

describe(LocalStrategy.name, () => {
  const USERNAME = 'username';
  const PASSWORD = 'password';

  let user: NonNullable<AuthenticationUserResult>;
  let policy: LocalStrategyPolicy;
  let userPort: UserPort;
  let passwordPort: PasswordPort;
  let validateUserService: LocalServiceInterface;
  let localStrategy: LocalStrategy;

  beforeEach(async () => {
    policy = new LocalStrategyPolicy({
      loginDto: LocalLoginDto,
      usernameField: USERNAME,
      passwordField: PASSWORD,
    });

    userPort = mock<UserPort>();
    passwordPort = mock<PasswordPort>();
    validateUserService = new LocalService(userPort, passwordPort);
    localStrategy = new LocalStrategy(policy, validateUserService);

    user = {
      id: randomUUID(),
      email: 'test@example.com',
      username: 'test',
      active: true,
    };
    jest.resetAllMocks();
    jest.spyOn(userPort, 'getByUsername').mockResolvedValue(user);
  });

  describe(LocalStrategy.prototype.validate, () => {
    it('should return user', async () => {
      jest.spyOn(passwordPort, 'validate').mockResolvedValue(true);

      const result = await localStrategy.validate({}, USERNAME, PASSWORD);
      expect(result.id).toBe(user.id);
    });

    it('should fail to validate user', async () => {
      jest
        .spyOn(validateUserService, 'validateUser')
        .mockImplementationOnce((_ctx, _dto: LocalValidateUserInterface) => {
          return null as unknown as Promise<ReferenceIdInterface<string>>;
        });

      const t = () => localStrategy.validate({}, USERNAME, PASSWORD);
      await expect(t).rejects.toThrow(LocalInvalidCredentialsException);
    });

    it('should fail to validate user with custom message', async () => {
      jest
        .spyOn(validateUserService, 'validateUser')
        .mockImplementation((_ctx, _dto: LocalValidateUserInterface) => {
          throw new LocalInvalidCredentialsException({
            message: 'Custom message',
            safeMessage: 'Custom safe message',
          });
        });

      const call = localStrategy.validate({}, USERNAME, PASSWORD);

      await expect(call).rejects.toBeInstanceOf(
        LocalInvalidCredentialsException,
      );
      await expect(call).rejects.toMatchObject({
        httpStatus: HttpStatus.UNAUTHORIZED,
        message: 'Custom message',
        safeMessage: 'Custom safe message',
      });
    });

    it('should fail with internal server error', async () => {
      jest
        .spyOn(validateUserService, 'validateUser')
        .mockImplementation((_ctx, _dto: LocalValidateUserInterface) => {
          throw new Error('This is really bad');
        });

      const call = localStrategy.validate({}, USERNAME, PASSWORD);

      await expect(call).rejects.toBeInstanceOf(LocalException);
      await expect(call).rejects.toMatchObject({
        httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
        context: expect.objectContaining({
          originalError: expect.objectContaining({
            message: 'This is really bad',
          }),
        }),
      });
    });

    it('should throw error on validateOrReject', async () => {
      const t = () => localStrategy.validate({}, USERNAME, '');
      await expect(t).rejects.toThrow();
    });

    it('should throw BadRequest on validateOrReject', async () => {
      jest
        .spyOn(classValidator, 'validateOrReject')
        .mockRejectedValueOnce(BadRequestException);

      const t = () => localStrategy.validate({}, USERNAME, PASSWORD);
      await expect(t).rejects.toThrow(LocalInvalidLoginDataException);
    });

    it('should return no user on userPort.getByUsername', async () => {
      jest.spyOn(userPort, 'getByUsername').mockResolvedValue(null);

      const t = () => localStrategy.validate({}, USERNAME, PASSWORD);
      await expect(t).rejects.toThrow(LocalInvalidCredentialsException);
    });

    it('should be invalid on passwordPort.validate', async () => {
      jest.spyOn(passwordPort, 'validate').mockResolvedValue(false);

      const t = () => localStrategy.validate({}, USERNAME, PASSWORD);
      await expect(t).rejects.toThrow(LocalInvalidCredentialsException);
    });
  });
});
