import { Possession } from 'accesscontrol/lib/enums';

import { PossessionEnum } from './possession.enum';

describe('Access control possession enumeration', () => {
  it('should match specification', () => {
    expect(PossessionEnum).toEqual({
      ANY: Possession.ANY,
      OWN: Possession.OWN,
    });
  });
});
