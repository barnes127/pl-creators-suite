export type HistoryTransactionId =
  string;


export interface HistoryTransactionContext {
  projectId?: string;

  slice?: string;

  engine?: string;

  actorId?: string;

  metadata?:
    Record<
      string,
      unknown
    >;
}


export interface HistoryTransaction<
  TState = unknown,
> {
  id: HistoryTransactionId;

  label: string;

  timestamp: string;

  context:
    HistoryTransactionContext;

  before:
    TState;

  after:
    TState;
}


export interface HistoryState {
  canUndo: boolean;

  canRedo: boolean;

  currentIndex: number;

  length: number;

  branchWarning: boolean;
}


export interface HistoryAdapter<
  TState = unknown,
> {
  capture():
    TState;

  restore(
    state:
      TState,
  ):
    void |
    Promise<void>;
}
