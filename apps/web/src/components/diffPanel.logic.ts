import type { Thread, TurnDiffSummary } from "../types";

interface CheckpointDiffAvailabilityInput {
  activeThread: Thread | undefined;
  selectedTurn: TurnDiffSummary | undefined;
}

export function getUnavailableCheckpointDiffMessage({
  activeThread,
  selectedTurn,
}: CheckpointDiffAvailabilityInput): string | null {
  if (!selectedTurn) {
    return null;
  }

  const checkpointMissing = selectedTurn.status === "missing" || !selectedTurn.checkpointRef;
  if (!checkpointMissing) {
    return null;
  }

  const isLatestTurn = activeThread?.latestTurn?.turnId === selectedTurn.turnId;
  if (isLatestTurn) {
    return null;
  }

  return "Checkpoint diff is unavailable for this turn.";
}
