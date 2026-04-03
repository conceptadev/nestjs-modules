import { of } from 'rxjs';

import { CallHandler, ExecutionContext, Injectable } from '@nestjs/common';

import { ContextOverlayInterceptor } from '../context-overlay.interceptor';
import { OverlayRef } from '../overlay-ref';

const TestRef = new OverlayRef<'withTest', { value: string }>('withTest');

@Injectable()
class TestOverlay extends ContextOverlayInterceptor {
  readonly ref = TestRef;
  attach = jest.fn();
}

describe('ContextOverlayInterceptor', () => {
  let overlay: TestOverlay;
  let mockContext: ExecutionContext;
  let mockNext: CallHandler;

  beforeEach(() => {
    overlay = new TestOverlay();

    mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    mockNext = { handle: jest.fn().mockReturnValue(of({})) };
  });

  it('should call attach with the execution context', async () => {
    await overlay.intercept(mockContext, mockNext);
    expect(overlay.attach).toHaveBeenCalledWith(mockContext);
  });

  it('should call next.handle()', async () => {
    await overlay.intercept(mockContext, mockNext);
    expect(mockNext.handle).toHaveBeenCalled();
  });

  it('should return the observable from next.handle()', async () => {
    const observable = of({ result: true });
    mockNext.handle = jest.fn().mockReturnValue(observable);

    const result = await overlay.intercept(mockContext, mockNext);
    expect(result).toBe(observable);
  });
});
