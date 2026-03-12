import { describe, expect, it } from "vitest";
import { MessageId, ProjectId, ThreadId, TurnId } from "@t3tools/contracts";

import { getUnavailableCheckpointDiffMessage } from "./diffPanel.logic";
import type { Thread, TurnDiffSummary } from "../types";

const turnId = TurnId.makeUnsafe("turn-1");
const otherTurnId = TurnId.makeUnsafe("turn-2");

function makeThread(overrides: Partial<Thread> = {}): Thread {
  return {
    id: ThreadId.makeUnsafe("thread-1"),
    codexThreadId: null,
    projectId: ProjectId.makeUnsafe("project-1"),
    title: "Thread",
    model: "gpt-5-codex",
    runtimeMode: "full-access",
    interactionMode: "default",
    session: null,
    messages: [],
    proposedPlans: [],
    error: null,
    createdAt: new Date().toISOString(),
    latestTurn: null,
    branch: null,
    worktreePath: null,
    turnDiffSummaries: [],
    activities: [],
    ...overrides,
  };
}

function makeTurnSummary(overrides: Partial<TurnDiffSummary> = {}): TurnDiffSummary {
  return {
    turnId,
    completedAt: new Date().toISOString(),
    status: "ready",
    files: [],
    checkpointRef: "checkpoint:1" as never,
    assistantMessageId: MessageId.makeUnsafe("assistant:1"),
    checkpointTurnCount: 1,
    ...overrides,
  };
}

describe("getUnavailableCheckpointDiffMessage", () => {
  it("returns an unavailable message for historical missing checkpoints", () => {
    const thread = makeThread({
      latestTurn: {
        turnId: otherTurnId,
        state: "completed",
        requestedAt: new Date().toISOString(),
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        assistantMessageId: null,
      },
    });

    const message = getUnavailableCheckpointDiffMessage({
      activeThread: thread,
      selectedTurn: makeTurnSummary({ status: "missing", checkpointRef: undefined }),
    });

    expect(message).toBe("Checkpoint diff is unavailable for this turn.");
  });

  it("allows the latest turn to keep retrying while checkpoint capture catches up", () => {
    const thread = makeThread({
      latestTurn: {
        turnId,
        state: "completed",
        requestedAt: new Date().toISOString(),
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        assistantMessageId: null,
      },
    });

    const message = getUnavailableCheckpointDiffMessage({
      activeThread: thread,
      selectedTurn: makeTurnSummary({ status: "missing", checkpointRef: undefined }),
    });

    expect(message).toBeNull();
  });

  it("does not block ready checkpoints", () => {
    const message = getUnavailableCheckpointDiffMessage({
      activeThread: makeThread(),
      selectedTurn: makeTurnSummary(),
    });

    expect(message).toBeNull();
  });
});
