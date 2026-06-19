export type EngineStatus = "idle" | "ready" | "running" | "paused" | "error";

export type EngineSeverity = "info" | "warning" | "error";

export type EngineMessage = {
  id: string;
  severity: EngineSeverity;
  message: string;
  source?: string;
};

export type EngineResult<T> =
  | {
      ok: true;
      data: T;
      messages: EngineMessage[];
    }
  | {
      ok: false;
      error: string;
      messages: EngineMessage[];
    };

export type EngineRuntimeState = {
  status: EngineStatus;
  startedAt: string | null;
  updatedAt: string | null;
  messages: EngineMessage[];
};

export function createEngineRuntimeState(): EngineRuntimeState {
  return {
    status: "idle",
    startedAt: null,
    updatedAt: null,
    messages: [],
  };
}

export function engineOk<T>(
  data: T,
  messages: EngineMessage[] = []
): EngineResult<T> {
  return {
    ok: true,
    data,
    messages,
  };
}

export function engineError<T = never>(
  error: string,
  messages: EngineMessage[] = []
): EngineResult<T> {
  return {
    ok: false,
    error,
    messages,
  };
}
