import type {
  PlatformEventListener,
  PlatformEventMetadata,
  PlatformEventName,
} from "./types";

import type {
  EventBus,
} from "./eventBus";

export const EVENT_API_SERVICE_ID =
  "core.event";

export class EventApi<
  TEventMap extends object,
> {
  constructor(
    private readonly bus:
      EventBus<TEventMap>,
  ) {}

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
    return this.bus.subscribe(
      type,
      listener,
    );
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
    return this.bus.once(
      type,
      listener,
    );
  }

  emit<
    TEventName extends
      PlatformEventName<TEventMap>,
  >(
    type: TEventName,
    payload:
      TEventMap[TEventName],
    metadata:
      PlatformEventMetadata,
  ) {
    return this.bus.emit(
      type,
      payload,
      metadata,
    );
  }

  listenerCount(
    type?:
      PlatformEventName<TEventMap>,
  ) {
    return this.bus
      .listenerCount(
        type,
      );
  }
}
