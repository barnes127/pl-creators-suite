import {useCallback, useEffect, useState} from "react";
import type {HealthSnapshot} from "@pl/platform";
import {rpc} from "../../rpc";

export function useHealthSnapshot(projectRoot: string) {
  const [snapshot, setSnapshot] =
    useState<HealthSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const refresh =
    useCallback(
      async () => {
        setLoading(true);
        try {
          const result =
            await rpc<{health: HealthSnapshot}>(
              "health.snapshot",
              {projectRoot:projectRoot || undefined},
            );
          setSnapshot(result.health);
          setError("");
        } catch (
          caught
        ) {
          setError(
            caught instanceof
              Error
              ? caught.message
              : String(caught),
          );
        } finally {
          setLoading(false);
        }
      },
      [projectRoot],
    );
  useEffect(() => {void refresh()}, [refresh]);
  return {
    snapshot,
    loading,
    error,
    refresh,
  };
}
