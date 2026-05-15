import { CrudResponseMetrics } from './crud-response-metrics.interface';

export interface CrudResponsePaginatedInterface<T = unknown> {
  data: T[];
  limit: number;
  count: number;
  total: number;
  page: number;
  pageCount: number;
  metrics?: CrudResponseMetrics;
}
