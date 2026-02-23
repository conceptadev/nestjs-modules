import { isUUID } from 'class-validator';

import { uuidGeneratorUtil } from '../uuid-generator.util';

describe(uuidGeneratorUtil.name, () => {
  it('should return a valid UUID', () => {
    const result = uuidGeneratorUtil();

    expect(isUUID(result, '4')).toBe(true);
  });

  it('should return a unique value on each call', () => {
    const a = uuidGeneratorUtil();
    const b = uuidGeneratorUtil();

    expect(a).not.toBe(b);
  });
});
