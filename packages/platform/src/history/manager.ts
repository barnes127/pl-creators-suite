import type {
  HistoryAdapter,
  HistoryState,
  HistoryTransaction,
} from "./types";


export class HistoryManager<
  TState = unknown,
> {
  private readonly transactions:
    HistoryTransaction<TState>[] =
      [];


  private currentIndex =
    -1;


  private branchWarning =
    false;


  constructor(
    private readonly adapter:
      HistoryAdapter<TState>,
  ) {}


  push(
    transaction:
      HistoryTransaction<TState>,
  ) {
    if (
      this.currentIndex <
      this.transactions.length -
      1
    ) {
      this.transactions.splice(
        this.currentIndex +
        1,
      );


      this.branchWarning =
        true;
    }


    this.transactions.push(
      transaction,
    );


    this.currentIndex =
      this.transactions.length -
      1;
  }


  async undo() {
    if (
      !this.canUndo()
    ) {
      return false;
    }


    const transaction =
      this.transactions[
        this.currentIndex
      ];


    await this.adapter.restore(
      transaction.before,
    );


    this.currentIndex -=
      1;


    return true;
  }


  async redo() {
    if (
      !this.canRedo()
    ) {
      return false;
    }


    const nextIndex =
      this.currentIndex +
      1;


    const transaction =
      this.transactions[
        nextIndex
      ];


    await this.adapter.restore(
      transaction.after,
    );


    this.currentIndex =
      nextIndex;


    return true;
  }


  canUndo() {
    return this.currentIndex >=
      0;
  }


  canRedo() {
    return this.currentIndex <
      this.transactions.length -
      1;
  }


  getState():
    HistoryState {
    return {
      canUndo:
        this.canUndo(),

      canRedo:
        this.canRedo(),

      currentIndex:
        this.currentIndex,

      length:
        this.transactions.length,

      branchWarning:
        this.branchWarning,
    };
  }


  list() {
    return [
      ...this.transactions,
    ];
  }


  clear() {
    this.transactions.splice(
      0,
    );


    this.currentIndex =
      -1;


    this.branchWarning =
      false;
  }


  clearBranchWarning() {
    this.branchWarning =
      false;
  }
}
