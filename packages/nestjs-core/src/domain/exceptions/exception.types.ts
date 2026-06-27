import { type ExceptionContext } from '../types/operation.types';

export type RuntimeExceptionContext = ExceptionContext & {
  originalError?: Error;
};
