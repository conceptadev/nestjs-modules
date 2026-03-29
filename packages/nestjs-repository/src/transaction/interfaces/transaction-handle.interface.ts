export interface TransactionHandleInterface {
  onCommit(fn: () => void | Promise<void>): void;
  onRollback(fn: () => void | Promise<void>): void;
}
