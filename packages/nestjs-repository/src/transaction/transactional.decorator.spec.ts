import { Transactional, TRANSACTIONAL_KEY } from './transactional.decorator.js';

describe('Transactional decorator', () => {
  it('should apply metadata with default options', () => {
    class TestClass {
      @Transactional()
      testMethod() {
        return 'test';
      }
    }

    const metadata = Reflect.getMetadata(
      TRANSACTIONAL_KEY,
      TestClass.prototype.testMethod,
    );

    expect(metadata).toBeDefined();
    expect(metadata.readOnly).toBe(false);
    expect(metadata.timeout).toBeUndefined();
  });

  it('should apply metadata with readOnly=true', () => {
    class TestClass {
      @Transactional({ readOnly: true })
      testMethod() {
        return 'test';
      }
    }

    const metadata = Reflect.getMetadata(
      TRANSACTIONAL_KEY,
      TestClass.prototype.testMethod,
    );

    expect(metadata.readOnly).toBe(true);
  });

  it('should apply metadata with timeout', () => {
    class TestClass {
      @Transactional({ timeout: 5000 })
      testMethod() {
        return 'test';
      }
    }

    const metadata = Reflect.getMetadata(
      TRANSACTIONAL_KEY,
      TestClass.prototype.testMethod,
    );

    expect(metadata.timeout).toBe(5000);
  });

  it('should apply metadata with multiple options', () => {
    class TestClass {
      @Transactional({
        readOnly: true,
        timeout: 10000,
      })
      testMethod() {
        return 'test';
      }
    }

    const metadata = Reflect.getMetadata(
      TRANSACTIONAL_KEY,
      TestClass.prototype.testMethod,
    );

    expect(metadata.readOnly).toBe(true);
    expect(metadata.timeout).toBe(10000);
  });
});
