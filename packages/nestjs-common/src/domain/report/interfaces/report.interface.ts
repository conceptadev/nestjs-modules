import { AuditInterface } from '../../../audit/interfaces/audit.interface';
import { ReferenceIdInterface } from '../../../reference/interfaces/reference-id.interface';
import { FileOwnableInterface } from '../../file/interfaces/file-ownable.interface';
import { ReportStatusEnum } from '../enum/report-status.enum';

/**
 * Interface representing a report entity
 */
export interface ReportInterface
  extends ReferenceIdInterface, FileOwnableInterface, AuditInterface {
  /**
   * Service key associated with the report
   */
  serviceKey: string;

  /**
   * Report name of the report
   */
  name: string;

  /**
   * Status of the report
   */
  status: ReportStatusEnum;

  /**
   * Error message (null if no error)
   */
  errorMessage: string | null;

  /**
   * Dynamic download URI for the report
   */
  downloadUrl?: string;
}
