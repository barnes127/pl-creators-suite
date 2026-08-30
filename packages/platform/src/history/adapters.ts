import type {
  HistoryAdapter,
} from "./types";


export function createHistoryAdapter<
  TState,
>(
  capture:
    () => TState,
  restore:
    (
      state:
        TState,
    ) =>
      void |
      Promise<void>,
): HistoryAdapter<TState> {
  return {
    capture,
    restore,
  };
}
