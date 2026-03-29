import { of } from 'rxjs';

import { CallHandler, ExecutionContext } from '@nestjs/common';

import { ContextOverlayInterceptor } from '../context-overlay.interceptor';
import { ContextOverlayInterface } from '../interfaces/context-overlay.interface';
import { OverlayRef } from '../overlay-ref';

describe('ContextOverlayInterceptor', () => {
  const TestRef = new OverlayRef<'withTest', { value: string }>('withTest');

  let overlay: ContextOverlayInterface<'withTest', { value: string }>;
  let interceptor: ContextOverlayInterceptor;
  let mockContext: ExecutionContext;
  let mockNext: CallHandler;

  beforeEach(() => {
    overlay = {
      ref: TestRef,
      resolve: jest.fn().mockReturnValue({ value: 'resolved' }),
      attach: jest.fn(),
    };

    interceptor = new ContextOverlayInterceptor(overlay);

    mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    mockNext = { handle: jest.fn().mockReturnValue(of({})) };
  });

  it('should call overlay.attach with the execution context', () => {
    interceptor.intercept(mockContext, mockNext);
    expect(overlay.attach).toHaveBeenCalledWith(mockContext);
  });

  it('should call next.handle()', () => {
    interceptor.intercept(mockContext, mockNext);
    expect(mockNext.handle).toHaveBeenCalled();
  });

  it('should return the observable from next.handle()', () => {
    const observable = of({ result: true });
    mockNext.handle = jest.fn().mockReturnValue(observable);

    const result = interceptor.intercept(mockContext, mockNext);
    expect(result).toBe(observable);
  });
});
