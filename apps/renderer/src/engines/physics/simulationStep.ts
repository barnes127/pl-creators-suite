export type SimulationStepConfig = {
  fixedDeltaSeconds: number;
  maxSubsteps: number;
};

export type SimulationStepResult<TState> = {
  state: TState;
  accumulator: number;
  stepsRun: number;
};

export const DEFAULT_SIMULATION_STEP_CONFIG: SimulationStepConfig = {
  fixedDeltaSeconds: 1 / 60,
  maxSubsteps: 5,
};

export function runFixedTimestep<TState>(
  state: TState,
  accumulator: number,
  frameDeltaSeconds: number,
  step: (state: TState, deltaSeconds: number) => TState,
  config = DEFAULT_SIMULATION_STEP_CONFIG
): SimulationStepResult<TState> {
  const fixedDeltaSeconds =
    config.fixedDeltaSeconds > 0 ? config.fixedDeltaSeconds : 1 / 60;

  const maxSubsteps = Math.max(1, config.maxSubsteps);
  let nextState = state;
  let nextAccumulator = accumulator + Math.max(0, frameDeltaSeconds);
  let stepsRun = 0;

  while (nextAccumulator >= fixedDeltaSeconds && stepsRun < maxSubsteps) {
    nextState = step(nextState, fixedDeltaSeconds);
    nextAccumulator -= fixedDeltaSeconds;
    stepsRun += 1;
  }

  return {
    state: nextState,
    accumulator: nextAccumulator,
    stepsRun,
  };
}
