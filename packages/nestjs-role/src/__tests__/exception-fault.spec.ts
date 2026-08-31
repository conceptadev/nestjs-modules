import {
  type RuntimeException,
  type RuntimeExceptionFault,
} from '@concepta/nestjs-core';

import { RoleAssignmentConflictException } from '../application/exceptions/role-assignment-conflict.exception.js';
import { RoleAssignmentNotFoundException } from '../application/exceptions/role-assignment-not-found.exception.js';
import { RoleAssignmentsConflictException } from '../application/exceptions/role-assignments-conflict.exception.js';
import { RoleNotFoundException } from '../application/exceptions/role-not-found.exception.js';
import { RoleException } from '../application/exceptions/role.exception.js';
import { RoleEntityNotFoundException } from '../infrastructure/exceptions/role-entity-not-found.exception.js';

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
    name: 'RoleException (default)',
    build: () => new RoleException(),
    fault: 'internal',
  },
  {
    name: 'RoleAssignmentConflictException',
    build: () => new RoleAssignmentConflictException('roleId', 'assigneeId'),
    fault: 'client',
  },
  {
    name: 'RoleAssignmentNotFoundException',
    build: () => new RoleAssignmentNotFoundException('assignmentId'),
    fault: 'client',
  },
  {
    name: 'RoleAssignmentsConflictException',
    build: () => new RoleAssignmentsConflictException('assigneeId'),
    fault: 'client',
  },
  {
    name: 'RoleNotFoundException',
    build: () => new RoleNotFoundException({ id: 'id' }),
    fault: 'client',
  },
  {
    name: 'RoleEntityNotFoundException',
    build: () => new RoleEntityNotFoundException('SomeEntity'),
    fault: 'usage',
  },
];

describe('exception fault classification', () => {
  it.each(CASES)('$name has fault=$fault', ({ build, fault }) => {
    expect(build().fault).toEqual(fault);
  });
});
