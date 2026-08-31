import {
  type RuntimeException,
  type RuntimeExceptionFault,
} from '@concepta/nestjs-core';

import { AccessControllerException } from '../domain/exceptions/access-controller.exception.js';

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
    name: 'AccessControllerException',
    build: () => new AccessControllerException('failure'),
    fault: 'usage',
  },
];

describe('exception fault classification', () => {
  it.each(CASES)('$name has fault=$fault', ({ build, fault }) => {
    expect(build().fault).toEqual(fault);
  });
});
