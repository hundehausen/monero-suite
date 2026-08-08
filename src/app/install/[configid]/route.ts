import { getInstallScript } from "@/app/lib/config-files";

const FETCH_TIMEOUT_MS = 10_000;
const MAX_SCRIPT_SIZE = 1024 * 1024;
const VALID_CONFIG_ID = /^[A-Za-z0-9_-]{21}$/;
const ALLOWED_HOSTS = ["vercel-storage.com"];

class BodyTooLargeError extends Error {}

/**
 * Reads a response body while enforcing a hard byte cap. The content-length
 * header check alone is insufficient: chunked responses omit it entirely.
 */
async function readTextWithLimit(
  response: Response,
  maxBytes: number
): Promise<string> {
  if (!response.body) {
    const text = await response.text();
    if (new TextEncoder().encode(text).byteLength > maxBytes) {
      throw new BodyTooLargeError();
    }
    return text;
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > maxBytes) {
        throw new BodyTooLargeError();
      }
      chunks.push(value);
    }
  } finally {
    await reader.cancel().catch(() => {});
  }

  const merged = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(merged);
}

function isAllowedHost(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return ALLOWED_HOSTS.some(
      (allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`)
    );
  } catch {
    return false;
  }
}

export async function GET(
  request: Request,
  props: { params: Promise<{ configid: string }> }
) {
  const params = await props.params;
  const configId = params.configid;

  if (!VALID_CONFIG_ID.test(configId)) {
    return new Response("Invalid config ID", { status: 400 });
  }

  try {
    const scriptUrl = await getInstallScript(configId);

    if (!isAllowedHost(scriptUrl)) {
      return new Response("Invalid script source", { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let script: string;
    try {
      const response = await fetch(scriptUrl, {
        signal: controller.signal,
      });

      if (!response.ok) {
        return new Response("Script not found", { status: 404 });
      }

      const contentLength = response.headers.get("content-length");
      if (contentLength && parseInt(contentLength) > MAX_SCRIPT_SIZE) {
        return new Response("Script too large", { status: 413 });
      }

      script = await readTextWithLimit(response, MAX_SCRIPT_SIZE);
    } catch (error) {
      if (error instanceof BodyTooLargeError) {
        return new Response("Script too large", { status: 413 });
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }

    return new Response(script, {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  } catch {
    return new Response("Script not found", { status: 404 });
  }
}
