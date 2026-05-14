import { AuditInterface } from '../../audit/interfaces/audit.interface';

/**
 * Metadata tracked by domain aggregates.
 *
 * Contains audit timestamps for persistence tracking.
 */
export interface AggregateMetaInterface extends AuditInterface {}
