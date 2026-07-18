import { type ExceptionContext } from '../types/operation.types.js';

export type RuntimeExceptionContext = ExceptionContext & {
  originalError?: Error;
};
