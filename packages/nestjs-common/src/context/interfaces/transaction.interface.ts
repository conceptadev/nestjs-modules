/**
 * A single transaction - manages lifecycle for one driver/datasource/run scope
 */
export interface TransactionInterface {
  readonly isActive: boolean;
  readonly isDirty: boolean;
  start(): Promise<void>;
  markDirty(): void;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  getClient<T = unknown>(): T;
}
