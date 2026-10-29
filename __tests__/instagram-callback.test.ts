/**
 * Instagram OAuth callback — Unit Tests
 *
 * Webhooks name the account by its professional account ID (user_id), so the
 * callback must store that, not the app-scoped `id`, or comments never match.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { mockPrisma, mockGetUserInfo, mockSubscribe } = vi.hoisted(() => ({
  mockPrisma: {
    workspaceMember: { findFirst: vi.fn() },
    instagramAccount: { upsert: vi.fn() },
  },
  mockGetUserInfo: vi.fn(),
  mockSubscribe: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "user_1" } }),
}));
vi.mock("@/lib/env", () => ({ getBaseUrl: () => "https://replynxt.com" }));
vi.mock("@/lib/instagram-accounts", () => ({
  canConnectInstagramAccount: vi.fn().mockResolvedValue({ allowed: true }),
}));
vi.mock("@/lib/workspace-access", () => ({ canManageWorkspace: () => true }));
vi.mock("@/lib/meta/oauth", () => ({
  verifyOAuthState: () => ({ workspaceId: "ws_1" }),
  exchangeCodeForToken: vi.fn().mockResolvedValue({ accessToken: "short" }),
  encryptToken: (token: string) => `enc:${token}`,
}));
vi.mock("@/lib/meta/client", () => ({
  getLongLivedToken: vi
    .fn()
    .mockResolvedValue({ accessToken: "long", expiresIn: 5184000 }),
  getUserInfo: mockGetUserInfo,
  subscribeInstagramAccountToWebhooks: mockSubscribe,
}));

import { GET } from "../app/api/instagram/callback/route";

beforeEach(() => {
  vi.clearAllMocks();
  mockPrisma.workspaceMember.findFirst.mockResolvedValue({
    role: "OWNER",
    workspace: { plan: "FREE", subscriptionStatus: "NONE" },
  });
  mockPrisma.instagramAccount.upsert.mockResolvedValue({});
  mockSubscribe.mockResolvedValue({ success: true });
});

function callback() {
  return GET(
    new NextRequest(
      "https://replynxt.com/api/instagram/callback?code=abc&state=signed"
    )
  );
}

describe("GET /api/instagram/callback", () => {
  it("stores and subscribes the professional account ID (user_id)", async () => {
    mockGetUserInfo.mockResolvedValue({
      id: "28730171606608415",
      user_id: "17841405542523740",
      username: "creator",
    });

    await callback();

    expect(mockSubscribe).toHaveBeenCalledWith("17841405542523740", "long");
    const upsert = mockPrisma.instagramAccount.upsert.mock.calls[0][0];
    expect(upsert.where).toEqual({ instagramId: "17841405542523740" });
    expect(upsert.create.instagramId).toBe("17841405542523740");
  });

  it("falls back to id when user_id is absent", async () => {
    mockGetUserInfo.mockResolvedValue({ id: "28730171606608415", username: "creator" });

    await callback();

    const upsert = mockPrisma.instagramAccount.upsert.mock.calls[0][0];
    expect(upsert.create.instagramId).toBe("28730171606608415");
  });
});
