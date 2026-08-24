import { BadRequestException } from '@nestjs/common';

import { crudStandardSchemaExceptionFactory } from './crud-standard-schema-exception.util.js';

describe(crudStandardSchemaExceptionFactory, () => {
  it('prefixes each message with its dotted field path', () => {
    const exception = crudStandardSchemaExceptionFactory([
      {
        message: 'Invalid input: expected string, received undefined',
        path: ['data'],
      },
      {
        message: 'Invalid input: expected string, received number',
        path: ['nested', 'key'],
      },
    ]);

    expect(exception).toBeInstanceOf(BadRequestException);
    expect(exception.getResponse()).toEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: [
        'data: Invalid input: expected string, received undefined',
        'nested.key: Invalid input: expected string, received number',
      ],
    });
  });

  it('resolves object path segments (StandardSchemaV1.PathSegment) to their key', () => {
    const exception = crudStandardSchemaExceptionFactory([
      { message: 'Required', path: [{ key: 'assigneeId' }] },
    ]);

    expect(exception.getResponse()).toEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: ['assigneeId: Required'],
    });
  });

  it('falls back to the bare message when no path is present', () => {
    const exception = crudStandardSchemaExceptionFactory([
      { message: 'Invalid input' },
    ]);

    expect(exception.getResponse()).toEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: ['Invalid input'],
    });
  });
});
