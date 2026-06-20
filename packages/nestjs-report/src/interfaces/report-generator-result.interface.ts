import {
  ReportUpdatableInterface,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';

export interface ReportGeneratorResultInterface
  extends ReportUpdatableInterface, ReferenceIdInterface {}
