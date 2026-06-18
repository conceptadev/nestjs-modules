import { AccessControlCreateOne } from './access-control-create-one.decorator';

/**
 * Recover one resource grant shortcut.
 *
 * @param resource - The grant resource.
 */
export const AccessControlRecoverOne = (resource: string) =>
  AccessControlCreateOne(resource);
