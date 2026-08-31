import {
  type RuntimeException,
  type RuntimeExceptionFault,
} from '@concepta/nestjs-core';

import { FederatedException } from '../domain/exceptions/federated.exception.js';
import { IdentityCreateUserException } from '../domain/exceptions/identity-create-user.exception.js';
import { IdentityFindUserException } from '../domain/exceptions/identity-find-user.exception.js';
import { IdentityUserRelationshipException } from '../domain/exceptions/identity-user-relationship.exception.js';

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
    name: 'FederatedException (default)',
    build: () => new FederatedException(),
    fault: 'internal',
  },
  {
    name: 'IdentityCreateUserException',
    build: () => new IdentityCreateUserException('SomeEntity'),
    fault: 'internal',
  },
  {
    name: 'IdentityFindUserException',
    build: () => new IdentityFindUserException('SomeEntity', { id: 'user-id' }),
    fault: 'client',
  },
  {
    name: 'IdentityUserRelationshipException',
    build: () => new IdentityUserRelationshipException('identity-id'),
    fault: 'client',
  },
];

describe('exception fault classification', () => {
  it.each(CASES)('$name has fault=$fault', ({ build, fault }) => {
    expect(build().fault).toEqual(fault);
  });
});
