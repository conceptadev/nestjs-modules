import { mock } from 'jest-mock-extended';
import { firstValueFrom, of } from 'rxjs';

import { CallHandler, ExecutionContext } from '@nestjs/common';

import { AccessControlPort } from '../../application/ports/access-control.port';

import { AccessControlFilter } from './access-control.filter';

describe(AccessControlFilter.name, () => {
  it('delegates each emitted value to AccessControlPort.filterResponseAttributes', async () => {
    const port = mock<AccessControlPort>();
    port.filterResponseAttributes.mockImplementation(async (_ctx, data) => ({
      filtered: data,
    }));

    const filter = new AccessControlFilter(port);
    const context = mock<ExecutionContext>();
    const callHandler = mock<CallHandler>();
    callHandler.handle.mockReturnValue(of({ original: true }));

    const result = await firstValueFrom(filter.intercept(context, callHandler));

    expect(result).toEqual({ filtered: { original: true } });
    expect(port.filterResponseAttributes).toHaveBeenCalledTimes(1);
    expect(port.filterResponseAttributes).toHaveBeenCalledWith(context, {
      original: true,
    });
  });

  it('passes data through when the port returns it unchanged', async () => {
    const port = mock<AccessControlPort>();
    port.filterResponseAttributes.mockResolvedValue('unchanged');

    const filter = new AccessControlFilter(port);
    const context = mock<ExecutionContext>();
    const callHandler = mock<CallHandler>();
    callHandler.handle.mockReturnValue(of('unchanged'));

    const result = await firstValueFrom(filter.intercept(context, callHandler));

    expect(result).toEqual('unchanged');
  });
});
