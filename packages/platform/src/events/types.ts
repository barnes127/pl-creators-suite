export type PlatformEventSource =
  | "renderer"
  | "desktop"
  | "worker"
  | "engine"
  | "workflow"
  | "extension"
  | "ai"
  | "cloud"
  | "collaboration"
  | "system";


export interface PlatformEventMetadata {
  source: PlatformEventSource;

  correlationId?: string;

  projectId?: string;

  actorId?: string;
}


export interface PlatformEventEnvelope<
  TPayload = unknown,
> {
  id: string;

  type: string;

  timestamp: string;

  metadata: PlatformEventMetadata;

  payload: TPayload;
}


export type PlatformEventListener<
  TPayload = unknown,
> = (
  event: PlatformEventEnvelope<TPayload>,
) =>
  | void
  | Promise<void>;


export type PlatformEventName<
  TEventMap extends object,
> =
  Extract<
    keyof TEventMap,
    string
  >;
