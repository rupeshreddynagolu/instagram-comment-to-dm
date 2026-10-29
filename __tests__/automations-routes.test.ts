/**
 * Campaign routes — Unit Tests
 *
 * The builder adds new targeting and message options, but ReplyNxt's plan
 * limits still apply to every way a campaign can be created.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { mockPrisma, mockContext } = vi.hoisted(() => ({
  mockPrisma: {
    workspace: { findUnique: vi.fn() },
    instagramAccount: { findFirst: vi.fn() },
    automation: {
      count: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    trackedLink: { findMany: vi.fn(), deleteMany: vi.fn() },
  },
  mockContext: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/auth", () => ({ getCurrentWorkspaceId: vi.fn() }));
vi.mock("@/lib/workspace-access", () => ({
  getCurrentWorkspaceContext: mockContext,
  canManageWorkspace: () => true,
}));

import { POST as createCampaign, PATCH as updateCampaign } from "../app/api/automations/route";
import { POST as importCampaigns } from "../app/api/automations/import/route";

function jsonRequest(url: string, method: string, body: unknown) {
  return new NextRequest(url, {
    method,
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

const account = { id: "acct_1", workspaceId: "ws_1", instagramId: "ig_1" };

beforeEach(() => {
  vi.clearAllMocks();
  mockContext.mockResolvedValue({ workspaceId: "ws_1", role: "OWNER" });
  mockPrisma.instagramAccount.findFirst.mockResolvedValue(account);
  mockPrisma.automation.findMany.mockResolvedValue([]);
  mockPrisma.automation.create.mockImplementation(async ({ data }) => ({
    id: "auto_new",
    ...data,
  }));
});

function onPlan(plan: "FREE" | "PRO", campaigns: number) {
  mockPrisma.workspace.findUnique.mockResolvedValue({
    id: "ws_1",
    plan,
    subscriptionStatus: plan === "FREE" ? "NONE" : "ACTIVE",
  });
  mockPrisma.automation.count.mockResolvedValue(campaigns);
}

describe("POST /api/automations", () => {
  it("refuses a second campaign on the FREE plan", async () => {
    onPlan("FREE", 1);

    const res = await createCampaign(
      jsonRequest("http://localhost/api/automations", "POST", {
        name: "Launch",
        goal: "Product link request",
        postId: "media_1",
        keywords: ["LINK"],
        dmMessage: "Here it is",
      })
    );

    expect(res.status).toBe(403);
    expect((await res.json()).error).toBe(
      "Plan limit reached. Your FREE plan allows up to 1 campaign(s)."
    );
    expect(mockPrisma.automation.create).not.toHaveBeenCalled();
  });

  it("creates an any-post campaign with its goal on a paid plan", async () => {
    onPlan("PRO", 3);

    const res = await createCampaign(
      jsonRequest("http://localhost/api/automations", "POST", {
        name: "Any post",
        goal: "Lead magnet",
        matchAnyPost: true,
        keywords: ["GUIDE"],
        dmMessage: "Here is the guide",
      })
    );

    expect(res.status).toBe(201);
    expect(mockPrisma.automation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          goal: "Lead magnet",
          matchAnyPost: true,
          postId: null,
        }),
      })
    );
  });
});

describe("POST /api/automations link without https://", () => {
  it("saves the link with https:// added", async () => {
    onPlan("PRO", 0);

    const res = await createCampaign(
      jsonRequest("http://localhost/api/automations", "POST", {
        name: "Store",
        goal: "Product link request",
        matchAnyPost: true,
        keywords: ["LINK"],
        dmMessage: "Here: {link}",
        trackedDestinationUrl: "yourstore.com/product",
      })
    );

    expect(res.status).toBe(201);
    const { data } = mockPrisma.automation.create.mock.calls[0][0];
    expect(JSON.stringify(data)).toContain('"destinationUrl":"https://yourstore.com/product"');
  });
});

describe("POST /api/automations/import", () => {
  it("refuses an import that would go over the plan's campaign limit", async () => {
    onPlan("FREE", 0);

    const res = await importCampaigns(
      jsonRequest("http://localhost/api/automations/import", "POST", {
        instagramAccountId: "acct_1",
        campaigns: [
          { postId: "media_1", keywords: ["A"], dmMessage: "one" },
          { postId: "media_2", keywords: ["B"], dmMessage: "two" },
        ],
      })
    );

    expect(res.status).toBe(403);
    expect((await res.json()).error).toMatch(/Plan limit reached/);
    expect(mockPrisma.automation.create).not.toHaveBeenCalled();
  });
});

describe("PATCH /api/automations", () => {
  it("leaves the goal alone when the update does not mention it", async () => {
    mockPrisma.automation.findFirst.mockResolvedValue({
      id: "auto_1",
      workspaceId: "ws_1",
      goal: "Lead magnet",
      trackedLinks: [],
    });
    mockPrisma.automation.update.mockResolvedValue({ id: "auto_1" });

    await updateCampaign(
      jsonRequest("http://localhost/api/automations?id=auto_1", "PATCH", {
        isActive: false,
      })
    );

    const { data } = mockPrisma.automation.update.mock.calls[0][0];
    expect(data).not.toHaveProperty("goal");
    expect(data.isActive).toBe(false);
  });
});
