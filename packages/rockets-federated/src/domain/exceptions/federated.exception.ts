import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/rockets-app';

export class FederatedException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super(options);
    this.errorCode = 'FEDERATED_ERROR';
  }
}
