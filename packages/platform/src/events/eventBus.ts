import type {
  PlatformEventEnvelope,
  PlatformEventListener,
  PlatformEventMetadata,
  PlatformEventName,
} from "./types";


export class EventBus<
  TEventMap extends object,
> {
  private readonly listeners =
    new Map<
      string,
      Set<
        PlatformEventListener<unknown>
      >
    >();


  private sequence =
    0;


  subscribe<
    TEventName extends
      PlatformEventName<TEventMap>,
  >(
    type: TEventName,
    listener:
      PlatformEventListener<
        TEventMap[TEventName]
      >,
  ) {
    const listenersForType =
      this.listeners.get(
        type,
      ) ??
      new Set<
        PlatformEventListener<unknown>
      >();


    listenersForType.add(
      listener as
        PlatformEventListener<unknown>,
    );


    this.listeners.set(
      type,
      listenersForType,
    );


    return () => {
      this.unsubscribe(
        type,
        listener,
      );
    };
  }


  once<
    TEventName extends
      PlatformEventName<TEventMap>,
  >(
    type: TEventName,
    listener:
      PlatformEventListener<
        TEventMap[TEventName]
      >,
  ) {
    const unsubscribe =
      this.subscribe(
        type,
        async (
          event,
        ) => {
          unsubscribe();

          await listener(
            event,
          );
        },
      );


    return unsubscribe;
  }


  unsubscribe<
    TEventName extends
      PlatformEventName<TEventMap>,
  >(
    type: TEventName,
    listener:
      PlatformEventListener<
        TEventMap[TEventName]
      >,
  ) {
    const listenersForType =
      this.listeners.get(
        type,
      );


    if (
      !listenersForType
    ) {
      return false;
    }


    const removed =
      listenersForType.delete(
        listener as
          PlatformEventListener<unknown>,
      );


    if (
      listenersForType.size ===
      0
    ) {
      this.listeners.delete(
        type,
      );
    }


    return removed;
  }


  async emit<
    TEventName extends
      PlatformEventName<TEventMap>,
  >(
    type: TEventName,
    payload:
      TEventMap[TEventName],
    metadata:
      PlatformEventMetadata,
  ): Promise<
    PlatformEventEnvelope<
      TEventMap[TEventName]
    >
  > {
    const event:
      PlatformEventEnvelope<
        TEventMap[TEventName]
      > = {
        id:
          this.createEventId(),

        type,

        timestamp:
          new Date().toISOString(),

        metadata,

        payload,
      };


    const listenersForType =
      this.listeners.get(
        type,
      );


    if (
      !listenersForType ||
      listenersForType.size ===
      0
    ) {
      return event;
    }


    const listeners =
      Array.from(
        listenersForType,
      );


    for (
      const listener
      of listeners
    ) {
      await listener(
        event as
          PlatformEventEnvelope<unknown>,
      );
    }


    return event;
  }


  listenerCount(
    type?:
      PlatformEventName<TEventMap>,
  ) {
    if (
      type
    ) {
      return (
        this.listeners.get(
          type,
        )?.size ??
        0
      );
    }


    let count =
      0;


    for (
      const listeners
      of this.listeners.values()
    ) {
      count +=
        listeners.size;
    }


    return count;
  }


  clear(
    type?:
      PlatformEventName<TEventMap>,
  ) {
    if (
      type
    ) {
      return this.listeners.delete(
        type,
      );
    }


    this.listeners.clear();

    return true;
  }


  private createEventId() {
    this.sequence +=
      1;


    return [
      Date.now(),
      this.sequence,
    ].join(
      "-",
    );
  }
}
