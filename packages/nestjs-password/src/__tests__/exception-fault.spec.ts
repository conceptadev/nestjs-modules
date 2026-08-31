import {
  type RuntimeException,
  type RuntimeExceptionFault,
} from '@concepta/nestjs-core';

import { PasswordCurrentRequiredException } from '../domain/exceptions/password-current-required.exception.js';
import { PasswordNotStrongException } from '../domain/exceptions/password-not-strong.exception.js';
import { PasswordRequiredException } from '../domain/exceptions/password-required.exception.js';
import { PasswordUsedRecentlyException } from '../domain/exceptions/password-used-recently.exception.js';
import { PasswordException } from '../domain/exceptions/password.exception.js';

/**
 * Anti-drift check: every `RuntimeException` subclass in this package states
 * an expected `fault` here.
 */
const CASES: {
  name: string;
  build: () => RuntimeException;
  fault: RuntimeExceptionFault;
}[] = [
  {
    name: 'PasswordException (default)',
    build: () => new PasswordException(),
    fault: 'internal',
  },
  {
    name: 'PasswordCurrentRequiredException',
    build: () => new PasswordCurrentRequiredException(),
    fault: 'client',
  },
  {
    name: 'PasswordNotStrongException',
    build: () => new PasswordNotStrongException(),
    fault: 'client',
  },
  {
    name: 'PasswordRequiredException',
    build: () => new PasswordRequiredException(),
    fault: 'client',
  },
  {
    name: 'PasswordUsedRecentlyException',
    build: () => new PasswordUsedRecentlyException(),
    fault: 'client',
  },
];

describe('exception fault classification', () => {
  it.each(CASES)('$name has fault=$fault', ({ build, fault }) => {
    expect(build().fault).toEqual(fault);
  });
});
