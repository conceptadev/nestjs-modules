import { AccessControlCreateOne } from './access-control-create-one.decorator';

/**
 * Create many resource grant shortcut.
 *
 * @param resource - The grant resource.
 */
export const AccessControlCreateMany = (resource: string) =>
  AccessControlCreateOne(resource);
