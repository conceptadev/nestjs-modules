import { Type } from '@nestjs/common';

export interface ModuleOptionsControllerInterface {
  controller?: false | Type | Type[];
}
