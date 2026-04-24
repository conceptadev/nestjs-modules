import { validateOrReject } from 'class-validator';
import { Strategy } from 'passport-local';

import { Inject, Injectable } from '@nestjs/common';

import {
  ReferenceIdInterface,
  ReferenceUsername,
  getAppContext,
} from '@concepta/nestjs-common';

import { LocalServiceInterface } from '../../../application/services/local/interfaces/local-service.interface';
import { LocalService } from '../../../application/services/local/local.service';
import { LocalStrategyPolicy } from '../../../domain/policies/local-strategy.policy';
import { PassportStrategyFactory } from '../../passport/passport-strategy.factory';

import { LocalInvalidCredentialsException } from './exceptions/local-invalid-credentials.exception';
import { LocalInvalidLoginDataException } from './exceptions/local-invalid-login-data.exception';
import { LocalException } from './exceptions/local.exception';
import { LOCAL_STRATEGY_NAME } from './local.constants';

/**
 * Define the Local strategy using passport.
 *
 * Local strategy is used to authenticate a user using a username and password.
 * The field username and password can be configured using the `usernameField` and `passwordField` properties.
 */
@Injectable()
export class LocalStrategy extends PassportStrategyFactory<Strategy>(
  Strategy,
  LOCAL_STRATEGY_NAME,
) {
  /**
   * @param policy - The local strategy policy
   * @param validateUserService - The service used validate passwords
   */
  constructor(
    @Inject(LocalStrategyPolicy)
    private policy: LocalStrategyPolicy,
    @Inject(LocalService)
    private validateUserService: LocalServiceInterface,
  ) {
    super({
      usernameField: policy.usernameField,
      passwordField: policy.passwordField,
      passReqToCallback: true,
    });
  }

  /**
   * Validate the user based on the username and password
   * from the request body
   *
   * @param req - The request object
   * @param username - The username to authenticate
   * @param password - The plain text password
   */
  async validate(req: unknown, username: ReferenceUsername, password: string) {
    const { loginDto, usernameField, passwordField } = this.policy;

    if (!loginDto) {
      throw new LocalException({ message: 'Login DTO is not configured.' });
    }

    // validate the dto
    const dto = new loginDto();
    dto[usernameField] = username;
    dto[passwordField] = password;

    try {
      await validateOrReject(dto);
    } catch (e) {
      throw new LocalInvalidLoginDataException({
        originalError: e,
      });
    }

    let validatedUser: ReferenceIdInterface;

    try {
      // try to get fully validated user
      validatedUser = await this.validateUserService.validateUser(
        getAppContext(req),
        {
          username,
          password,
        },
      );
    } catch (e) {
      // did they throw an invalid credentials exception?
      if (e instanceof LocalInvalidCredentialsException) {
        // yes, use theirs
        throw e;
      } else {
        // something else went wrong
        throw new LocalException({ originalError: e });
      }
    }

    // did we get a valid user?
    if (!validatedUser) {
      throw new LocalInvalidCredentialsException({
        message: `Unable to validate user with username: %s`,
        messageParams: [username],
      });
    }

    return validatedUser;
  }
}
