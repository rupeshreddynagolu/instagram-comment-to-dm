/**
 * Comment reconciler — Unit Tests
 *
 * The poller catches comments whose webhook never arrived. It must enqueue a
 * comment only when it matches, is not already answered, and has no SENT DM,
 * so a comment the webhook already handled never gets a second DM.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma, mockQueueAdd, mockGetRecentMediaComments } = vi.hoisted(
  () => ({
    mockPrisma: {
      automation: { findMany: vi.fn() },
      dmLog: { findMany: vi.fn() },
      operationalEvent: { create: vi.fn() },
    },
    mockQueueAdd: vi.fn(),
    mockGetRecentMediaComments: vi.fn(),
  })
);

vi.mock("@/lib/db/client", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/queue/client", () => ({
  getDMQueue: () => ({ add: mockQueueAdd }),
}));
vi.mock("@/lib/meta/oauth", () => ({ decryptToken: () => "token" }));
vi.mock("@/lib/meta/client", () => ({
  getRecentMediaComments: mockGetRecentMediaComments,
  getUserMedia: vi.fn(),
  MetaApiError: class MetaApiError extends Error {},
}));

import { reconcileComments } from "../lib/polling/comment-reconciler";

const OWNER = "17841405542523740";

beforeEach(() => {
  vi.clearAllMocks();
  mockPrisma.automation.findMany.mockResolvedValue([
    {
      id: "auto_1",
      name: "Testing",
      postId: "media_1",
      matchAnyPost: false,
      matchAnyWord: false,
      keywords: ["NICE"],
      wholeWordMatch: false,
      publicReplyEnabled: false,
      workspaceId: "ws_1",
      instagramAccount: {
        id: "acct_1",
        instagramId: OWNER,
        username: "owner",
        accessToken: "enc",
      },
    },
  ]);
  mockPrisma.operationalEvent.create.mockResolvedValue({});
  const ts = "2026-10-29T17:44:00+0000";
  mockGetRecentMediaComments.mockResolvedValue([
    // Already DM'd through the webhook.
    { id: "c_sent", text: "Nice", timestamp: ts, from: { id: "u1", username: "a" } },
    // Matches, never handled: the only one that should be queued.
    { id: "c_new", text: "nice one", timestamp: ts, from: { id: "u2", username: "b" } },
    // The owner already replied publicly.
    {
      id: "c_replied",
      text: "NICE",
      timestamp: ts,
      from: { id: "u3", username: "c" },
      replies: { data: [{ id: "r1", from: { id: OWNER } }] },
    },
    // No keyword.
    { id: "c_other", text: "hello", timestamp: ts, from: { id: "u4", username: "d" } },
    // The account's own comment.
    { id: "c_own", text: "nice", timestamp: ts, from: { id: OWNER, username: "owner" } },
  ]);
  mockPrisma.dmLog.findMany.mockResolvedValue([{ commentId: "c_sent" }]);
});

describe("reconcileComments", () => {
  it("queues only matching comments that nobody has answered", async () => {
    await reconcileComments();

    expect(mockQueueAdd).toHaveBeenCalledTimes(1);
    expect(mockQueueAdd).toHaveBeenCalledWith(
      "process-comment",
      expect.objectContaining({
        instagramAccountId: OWNER,
        commentId: "c_new",
        mediaId: "media_1",
        source: "POLLING",
      })
    );
  });

  it("checks the DM log for SENT so a webhook-handled comment is skipped", async () => {
    await reconcileComments();

    expect(mockPrisma.dmLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ automationId: "auto_1", status: "SENT" }),
      })
    );
  });
});
