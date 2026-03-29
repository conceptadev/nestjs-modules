import { HookContextInterface } from '@concepta/nestjs-common';

export interface WithHooksContextInterface {
  withHooks(): this & HookContextInterface;
}
