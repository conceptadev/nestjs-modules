import {
  ByIdInterface,
  ReferenceId,
  ReportCreatableInterface,
  ReportInterface,
  ReportUpdatableInterface,
  CreateOneInterface,
  ReferenceIdInterface,
  UpdateOneInterface,
  ReportEntityInterface,
} from '@concepta/nestjs-common';

export interface ReportModelServiceInterface
  extends
    ByIdInterface<ReferenceId, ReportEntityInterface>,
    CreateOneInterface<ReportCreatableInterface, ReportEntityInterface>,
    UpdateOneInterface<ReportUpdatableInterface, ReportEntityInterface> {
  getUniqueReport(
    org: Pick<ReportCreatableInterface, 'serviceKey' | 'name'>,
  ): Promise<ReportInterface | null>;
  getWithFile(report: ReferenceIdInterface): Promise<ReportInterface | null>;
}
