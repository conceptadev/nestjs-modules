import { of } from 'rxjs';

import { CallHandler, ExecutionContext } from '@nestjs/common';

import { getAppContext } from '@concepta/nestjs-common';

import { WithOtpContextInterface } from '../interfaces/with-otp-context.interface';
import { OtpContextInterceptor } from '../otp-context.interceptor';
import { OtpContextOverlay } from '../otp-context.overlay';

describe('OtpContextInterceptor', () => {
  let interceptor: OtpContextInterceptor;
  let overlay: OtpContextOverlay;
  let mockContext: ExecutionContext;
  let mockNext: CallHandler;
  let request: Record<string, unknown>;

  beforeEach(() => {
    overlay = {
      name: 'withOtp',
      resolve: jest.fn().mockReturnValue({ namespace: 'userOtp' }),
    } as unknown as OtpContextOverlay;

    interceptor = new OtpContextInterceptor(overlay);

    request = {};
    mockContext = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    mockNext = { handle: jest.fn().mockReturnValue(of({})) };
  });

  it('should call next.handle()', () => {
    interceptor.intercept(mockContext, mockNext);
    expect(mockNext.handle).toHaveBeenCalled();
  });

  it('should define withOtp on the context', () => {
    interceptor.intercept(mockContext, mockNext);
    const ctx = getAppContext<WithOtpContextInterface>(request);
    expect(typeof ctx.withOtp).toBe('function');
  });

  it('should not call resolve at intercept time', () => {
    interceptor.intercept(mockContext, mockNext);
    expect(overlay.resolve).not.toHaveBeenCalled();
  });

  it('should resolve lazily when withOtp() is called', () => {
    interceptor.intercept(mockContext, mockNext);
    const ctx = getAppContext<WithOtpContextInterface>(request);

    expect(overlay.resolve).not.toHaveBeenCalled();
    ctx.withOtp();
    expect(overlay.resolve).toHaveBeenCalledWith(mockContext);
  });

  it('should return overlay with namespace from withOtp()', () => {
    interceptor.intercept(mockContext, mockNext);
    const ctx = getAppContext<WithOtpContextInterface>(request);

    const otpCtx = ctx.withOtp();
    expect(otpCtx.namespace).toBe('userOtp');
  });
});
