import { mock } from 'jest-mock-extended';

import { ExecutionContext } from '@nestjs/common';

import { AccessControlPort } from '../../application/ports/access-control.port';

import { AccessControlGuard } from './access-control.guard';

describe(AccessControlGuard.name, () => {
  it('delegates canActivate to AccessControlPort.checkAccess and returns its result', async () => {
    const port = mock<AccessControlPort>();
    port.checkAccess.mockResolvedValue(true);

    const guard = new AccessControlGuard(port);
    const context = mock<ExecutionContext>();

    const result = await guard.canActivate(context);

    expect(result).toEqual(true);
    expect(port.checkAccess).toHaveBeenCalledTimes(1);
    expect(port.checkAccess).toHaveBeenCalledWith(context);
  });

  it('propagates a false result from the port', async () => {
    const port = mock<AccessControlPort>();
    port.checkAccess.mockResolvedValue(false);

    const guard = new AccessControlGuard(port);
    const context = mock<ExecutionContext>();

    const result = await guard.canActivate(context);

    expect(result).toEqual(false);
  });
});
