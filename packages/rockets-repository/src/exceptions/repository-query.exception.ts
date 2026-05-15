import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/rockets-app';

export class RepositoryQueryException extends RuntimeException {
  context: RuntimeException['context'] & { entityName: string };

  constructor(entityName: string, options?: RuntimeExceptionOptions) {
    super({
      message: 'Error while trying to query the %s repository',
      messageParams: [entityName],
      ...options,
    });

    this.context = { ...super.context, entityName };
    this.errorCode = 'REPOSITORY_QUERY_ERROR';
  }
}
