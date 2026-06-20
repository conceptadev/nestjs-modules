import { PlainLiteralObject } from '@nestjs/common';

import { HookWithSpec } from '../../hook/hook.types';

/**
 * Context interface for hooks.
 *
 * Contains the hooks array that the hook system gathers from
 * decorators and module registrations.
 */
export interface HookContextInterface extends PlainLiteralObject {
  /**
   * Normalized hook configurations to apply for this operation.
   */
  hooks: HookWithSpec[];
}
