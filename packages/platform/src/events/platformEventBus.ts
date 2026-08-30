import {
  EventBus,
} from "./eventBus";

import type {
  PlatformEventMap,
} from "./platformEvents";


export type PlatformEventBus =
  EventBus<
    PlatformEventMap
  >;


export function createPlatformEventBus() {
  return new EventBus<
    PlatformEventMap
  >();
}
