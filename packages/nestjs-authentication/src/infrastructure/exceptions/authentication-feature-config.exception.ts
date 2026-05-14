import { HttpStatus } from '@nestjs/common';

import { RuntimeExceptionOptions } from '@concepta/rockets-app';

import { AuthenticationException } from '../../domain/exceptions/authentication.exception';

/**
 * Exception thrown when a feature is configured but required ports are missing.
 */
export class AuthenticationFeatureConfigException extends AuthenticationException {
  constructor(
    feature: string,
    missingPorts: string[],
    options?: Omit<
      RuntimeExceptionOptions,
      'httpStatus' | 'message' | 'messageParams'
    >,
  ) {
    super({
      message:
        "Feature '%s' requires [%s] to be configured but no provider was found.",
      messageParams: [feature, missingPorts.join(', ')],
      ...options,
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
    });
    this.errorCode = 'AUTHENTICATION_FEATURE_CONFIG_ERROR';
  }
}
