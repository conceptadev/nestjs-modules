import { z } from 'zod';

import { conformsTo, withOpenApi } from '@concepta/nestjs-core';

import { type RoleCreatableInterface } from '../../domain/interfaces/role-creatable.interface.js';

/**
 * Used only as a request body — not a named OpenAPI component (no
 * `withNamedComponent`). Both fields default to `''` when omitted, matching
 * the legacy `RoleDto`'s property-initializer defaults (`name = ''`,
 * `description = ''`) plus `@IsOptional()` on `description` — omitting
 * either field today yields `''`, not a 400. Preserved as-is (not tightened
 * to a required/non-empty `name`), per explicit decision.
 */
export const roleCreateSchema = withOpenApi(
  conformsTo<RoleCreatableInterface>()(
    z.object({
      name: z.string().default('').meta({ description: 'Name of the role' }),
      description: z
        .string()
        .default('')
        .meta({ description: 'Description of the role' }),
    }),
  ),
);
