import { z } from 'zod';

import { conformsTo, withOpenApi } from '@concepta/nestjs-core';

import { type RoleUpdatableInterface } from '../../domain/interfaces/role-updatable.interface.js';

/**
 * Used only as a request body — not a named OpenAPI component (no
 * `withNamedComponent`). Structurally identical to `roleCreateSchema` (both
 * fields default to `''` when omitted) — kept as a separate schema since it
 * targets a distinct interface (`RoleUpdatableInterface`) and a distinct
 * wiring point (the Update operation).
 */
export const roleUpdateSchema = withOpenApi(
  conformsTo<RoleUpdatableInterface>()(
    z.object({
      name: z.string().default('').meta({ description: 'Name of the role' }),
      description: z
        .string()
        .default('')
        .meta({ description: 'Description of the role' }),
    }),
  ),
);
