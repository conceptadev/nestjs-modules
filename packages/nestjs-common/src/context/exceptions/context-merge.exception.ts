import { RuntimeExceptionOptions } from '../../exceptions/interfaces/runtime-exception-options.interface';
import { RuntimeException } from '../../exceptions/runtime.exception';

/**
 * Exception thrown when AppContextHost.apply() returns undefined
 * for a key that is not already registered on the context.
 */
export class ContextMergeException extends RuntimeException {
  constructor(key: string, options?: RuntimeExceptionOptions) {
    super({
      message: `AppContextHost.apply() must provide a value for missing key: "${key}"`,
      ...options,
    });

    this.errorCode = 'CONTEXT_MERGE_MISSING_KEY';
  }
}
