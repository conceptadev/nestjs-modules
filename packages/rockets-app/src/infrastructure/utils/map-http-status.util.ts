import {
  ERROR_CODE_HTTP_UNKNOWN,
  HTTP_ERROR_CODE,
} from '../constants/error-codes.constants';

/**
 * Map http status to error codes.
 *
 * @param statusCode - The HTTP status code to look up.
 */
export function mapHttpStatus(statusCode: number) {
  const errorCode = HTTP_ERROR_CODE.get(statusCode);
  return errorCode ?? ERROR_CODE_HTTP_UNKNOWN;
}
