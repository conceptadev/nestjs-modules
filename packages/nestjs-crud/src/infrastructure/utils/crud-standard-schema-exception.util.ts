import { type StandardSchemaV1 } from '@standard-schema/spec';

import { BadRequestException } from '@nestjs/common';

/**
 * Default `exceptionFactory` for `StandardSchemaValidationPipe`, used by
 * `crud-init-validation.decorator.ts`. The pipe's own default drops
 * `issue.path`, producing ambiguous messages (e.g. "Invalid input:
 * expected string, received undefined") when multiple fields fail —
 * this prefixes each message with its field path, matching the
 * field-identifying messages class-validator produced (e.g. "data must
 * be a string").
 */
export function crudStandardSchemaExceptionFactory(
  issues: readonly StandardSchemaV1.Issue[],
): BadRequestException {
  const messages = issues.map((issue) => {
    const path = issue.path
      ?.map((segment) => (typeof segment === 'object' ? segment.key : segment))
      .join('.');
    return path ? `${path}: ${issue.message}` : issue.message;
  });
  return new BadRequestException(messages);
}
