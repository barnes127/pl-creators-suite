import type {
  HistoryTransaction,
  HistoryTransactionContext,
} from "./types";


let transactionSequence =
  0;


export function createHistoryTransaction<
  TState,
>(
  params: {
    label: string;

    before:
      TState;

    after:
      TState;

    context?:
      HistoryTransactionContext;
  },
): HistoryTransaction<TState> {
  transactionSequence +=
    1;


  return {
    id:
      [
        Date.now(),
        transactionSequence,
      ].join(
        "-",
      ),

    label:
      params.label,

    timestamp:
      new Date()
        .toISOString(),

    context:
      params.context ??
      {},

    before:
      params.before,

    after:
      params.after,
  };
}
