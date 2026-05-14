import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/rockets-app';
/**
 * Generic crud exception.
 */
export class CrudException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super(options);
    this.errorCode = 'CRUD_ERROR';

    this.context = {
      ...super.context,
    };
  }
}
