import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { OtpContextOverlay } from '../otp-context.overlay';

describe('OtpContextOverlay', () => {
  let reflector: jest.Mocked<Reflector>;
  let overlay: OtpContextOverlay;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    overlay = new OtpContextOverlay(reflector);

    const handler = jest.fn();
    const target = class TestController {};
    mockContext = {
      getHandler: () => handler,
      getClass: () => target,
    } as unknown as ExecutionContext;
  });

  it('should have ref name "withOtp"', () => {
    expect(overlay.ref.name).toBe('withOtp');
  });

  it('should resolve namespace from decorator metadata', () => {
    reflector.getAllAndOverride.mockReturnValue({ name: 'userOtp' });

    const result = overlay.resolve(mockContext);

    expect(result).toEqual({ namespace: 'userOtp' });
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith('OTP_NAMESPACE', [
      mockContext.getHandler(),
      mockContext.getClass(),
    ]);
  });

  it('should return empty namespace when no decorator metadata', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    const result = overlay.resolve(mockContext);

    expect(result).toEqual({ namespace: '' });
  });
});
