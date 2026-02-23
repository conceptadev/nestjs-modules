import { OtpModule, OtpCreateDto, Otp } from '../index';

describe('index', () => {
  it('should be an instance of Function', () => {
    expect(OtpModule).toBeInstanceOf(Function);
  });

  it('should be an instance of Function', () => {
    expect(OtpCreateDto).toBeInstanceOf(Function);
  });

  it('should be an instance of Function', () => {
    expect(Otp).toBeInstanceOf(Function);
  });
});
