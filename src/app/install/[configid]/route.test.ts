import { describe, expect, it, vi, afterEach } from "vitest";
import { GET } from "./route";

vi.mock("@/app/lib/config-files", () => ({
  getInstallScript: vi.fn(),
}));

import { getInstallScript } from "@/app/lib/config-files";

const VALID_ID = "a".repeat(21);
const GOOD_URL = "https://abc123.public.blob.vercel-storage.com/install.sh";

const makeRequest = () => new Request(`https://monerosuite.org/install/${VALID_ID}`);
const makeProps = (configid = VALID_ID) => ({
  params: Promise.resolve({ configid }),
});

const mockedGetInstallScript = vi.mocked(getInstallScript);

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("GET /install/[configid]", () => {
  it("rejects malformed config IDs", async () => {
    mockedGetInstallScript.mockResolvedValue(GOOD_URL);
    const res = await GET(makeRequest(), makeProps("bad id!"));
    expect(res.status).toBe(400);
  });

  it("rejects script URLs outside the allowed blob hosts", async () => {
    mockedGetInstallScript.mockResolvedValue("https://evil.example.com/install.sh");
    const res = await GET(makeRequest(), makeProps());
    expect(res.status).toBe(400);
  });

  it("returns 404 when the blob fetch fails (no error body proxying)", async () => {
    mockedGetInstallScript.mockResolvedValue(GOOD_URL);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("<html>Internal Server Error</html>", { status: 500 })
      )
    );
    const res = await GET(makeRequest(), makeProps());
    expect(res.status).toBe(404);
    expect(await res.text()).not.toContain("Internal Server Error");
  });

  it("rejects oversized scripts announced via content-length", async () => {
    mockedGetInstallScript.mockResolvedValue(GOOD_URL);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("x", {
          status: 200,
          headers: { "content-length": String(1024 * 1024 + 1) },
        })
      )
    );
    const res = await GET(makeRequest(), makeProps());
    expect(res.status).toBe(413);
  });

  it("enforces the size cap on chunked bodies without content-length", async () => {
    mockedGetInstallScript.mockResolvedValue(GOOD_URL);
    const oversized = new Uint8Array(1024 * 1024 + 1);
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(oversized);
        controller.close();
      },
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(stream, { status: 200 }))
    );
    const res = await GET(makeRequest(), makeProps());
    expect(res.status).toBe(413);
  });

  it("serves a valid script as text/plain", async () => {
    mockedGetInstallScript.mockResolvedValue(GOOD_URL);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("#!/bin/bash\necho ok", { status: 200 }))
    );
    const res = await GET(makeRequest(), makeProps());
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/plain");
    expect(await res.text()).toContain("echo ok");
  });
});
