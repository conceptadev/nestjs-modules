import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/rockets-app';

/**
 * Exception thrown when duplicate repository keys are registered.
 */
export class RepositoryDuplicateKeyException extends RuntimeException {
  constructor(
    duplicates: { key: string; existing: string; attempted: string }[],
    options?: RuntimeExceptionOptions,
  ) {
    const details = duplicates.map(
      (d) =>
        `"${d.key}" (registered for ${d.existing}, attempted for ${d.attempted})`,
    );

    super({
      message: 'Duplicate repository keys: %s',
      messageParams: [details.join(', ')],
      ...options,
    });

    this.errorCode = 'DUPLICATE_REPOSITORY_KEY';
  }
}
