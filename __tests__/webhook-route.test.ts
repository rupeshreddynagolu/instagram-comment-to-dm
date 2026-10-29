/**
 * Meta webhook route — Unit Tests
 *
 * Requests with a bad signature come from anyone on the internet, so they
 * must not be able to fill the operations log.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    operationalEvent: { create: vi.fn() },
    webhookEvent: { create: vi.fn() },
  },
}));

vi.mock("@/lib/db/client", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/queue/client", () => ({ getDMQueue: () => ({ add: vi.fn() }) }));

import { POST } from "../app/api/webhook/route";

function unsignedRequest(body: string) {
  return new NextRequest("https://replynxt.com/api/webhook", {
    method: "POST",
    body,
    headers: { "x-hub-signature-256": "sha256=forged" },
  });
}

beforeEach(() => {
  vi.stubEnv("FACEBOOK_APP_SECRET", "secret");
  mockPrisma.operationalEvent.create.mockResolvedValue({});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

describe("POST /api/webhook with a bad signature", () => {
  it("rejects it and records at most one event, without the request body", async () => {
    const first = await POST(unsignedRequest('{"object":"instagram","secret":"x"}'));
    const second = await POST(unsignedRequest('{"object":"instagram"}'));

    expect(first.status).toBe(401);
    expect(second.status).toBe(401);
    expect(mockPrisma.operationalEvent.create).toHaveBeenCalledTimes(1);
    const { payload } = mockPrisma.operationalEvent.create.mock.calls[0][0].data;
    expect(payload).not.toHaveProperty("bodyPreview");
    expect(mockPrisma.webhookEvent.create).not.toHaveBeenCalled();
  });
});
