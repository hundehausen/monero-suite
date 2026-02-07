import { getInstallScript } from "@/app/lib/config-files";

const FETCH_TIMEOUT_MS = 10_000; // 10 seconds
const MAX_SCRIPT_SIZE = 1024 * 1024; // 1MB

export async function GET(
  request: Request,
  props: { params: Promise<{ configid: string }> }
) {
  try {
    const params = await props.params;
    const scriptUrl = await getInstallScript(params.configid);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let script: string;
    try {
      const response = await fetch(scriptUrl, {
        signal: controller.signal,
      });

      const contentLength = response.headers.get("content-length");
      if (contentLength && parseInt(contentLength) > MAX_SCRIPT_SIZE) {
        return new Response("Script too large", { status: 413 });
      }

      script = await response.text();
    } finally {
      clearTimeout(timeout);
    }

    return new Response(script, {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    return new Response(
      `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      { status: 404 }
    );
  }
}
