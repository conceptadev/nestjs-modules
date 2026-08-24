import { z } from 'zod';

import { withOpenApi } from '@concepta/nestjs-core';

/**
 * Zod equivalent of the legacy `DeviceDto` — no domain interface exists
 * for these TypeORM test fixtures, so there is no `conformsTo` to apply.
 */
export const deviceSchema = withOpenApi(
  z.object({
    deviceKey: z.string(),
    description: z.string().optional(),
  }),
);
