import { ExceptionContext } from '../../types/operation.types';

export interface ExceptionInterface extends Error {
  /**
   * The error code.
   */
  errorCode: string;

  /**
   * Additional context
   */
  context?: ExceptionContext;
}
