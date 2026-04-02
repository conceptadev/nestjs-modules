import { Transactional, TRANSACTIONAL_KEY } from './transactional.decorator';

describe('Transactional decorator', () => {
  class TestError extends Error {}

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
    expect(metadata.propagation).toBe('SUPPORTS');
    expect(metadata.readOnly).toBe(false);
    expect(metadata.noRollbackFor).toEqual([]);
    expect(metadata.timeout).toBeUndefined();
  });

  it('should apply metadata with custom propagation', () => {
    class TestClass {
      @Transactional({ propagation: 'MANDATORY' })
      testMethod() {
        return 'test';
      }
    }

    const metadata = Reflect.getMetadata(
      TRANSACTIONAL_KEY,
      TestClass.prototype.testMethod,
    );

    expect(metadata.propagation).toBe('MANDATORY');
  });

  it('should apply metadata with SUPPORTS propagation', () => {
    class TestClass {
      @Transactional({ propagation: 'SUPPORTS' })
      testMethod() {
        return 'test';
      }
    }

    const metadata = Reflect.getMetadata(
      TRANSACTIONAL_KEY,
      TestClass.prototype.testMethod,
    );

    expect(metadata.propagation).toBe('SUPPORTS');
  });

  it('should apply metadata with MANDATORY propagation', () => {
    class TestClass {
      @Transactional({ propagation: 'MANDATORY' })
      testMethod() {
        return 'test';
      }
    }

    const metadata = Reflect.getMetadata(
      TRANSACTIONAL_KEY,
      TestClass.prototype.testMethod,
    );

    expect(metadata.propagation).toBe('MANDATORY');
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

  it('should apply metadata with noRollbackFor', () => {
    class TestClass {
      @Transactional({ noRollbackFor: [TestError] })
      testMethod() {
        return 'test';
      }
    }

    const metadata = Reflect.getMetadata(
      TRANSACTIONAL_KEY,
      TestClass.prototype.testMethod,
    );

    expect(metadata.noRollbackFor).toContain(TestError);
  });

  it('should apply metadata with multiple options', () => {
    class TestClass {
      @Transactional({
        propagation: 'SUPPORTS',
        readOnly: true,
        timeout: 10000,
        noRollbackFor: [TestError],
      })
      testMethod() {
        return 'test';
      }
    }

    const metadata = Reflect.getMetadata(
      TRANSACTIONAL_KEY,
      TestClass.prototype.testMethod,
    );

    expect(metadata.propagation).toBe('SUPPORTS');
    expect(metadata.readOnly).toBe(true);
    expect(metadata.timeout).toBe(10000);
    expect(metadata.noRollbackFor).toContain(TestError);
  });
});
