import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-common';

/**
 * Federation-specific crud exception.
 */
export class CrudFederationException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super(options);
    this.errorCode = 'CRUD_FEDERATION_ERROR';

    this.context = {
      ...super.context,
    };
  }
}
