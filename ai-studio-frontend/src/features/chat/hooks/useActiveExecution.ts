import { useMemo } from "react";

import { useExecutionStore } from "../store/execution.store";

export function useActiveExecution(
  chatId?: string,
) {
  const runs = useExecutionStore(
    (state) => state.runs,
  );

  const activeRun = useMemo(() => {
    if (!chatId) {
      return null;
    }

    const chatRuns = Object.values(runs)
      .filter(
        (run) => run.chatId === chatId,
      )
      .sort(
        (a, b) =>
          new Date(
            b.startedAt,
          ).getTime() -
          new Date(
            a.startedAt,
          ).getTime(),
      );

    return (
      chatRuns.find(
        (run) =>
          run.status === "queued" ||
          run.status === "running",
      ) ??
      chatRuns[0] ??
      null
    );
  }, [chatId, runs]);

  return activeRun;
}