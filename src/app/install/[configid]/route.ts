import { getInstallScript } from "@/app/lib/config-files";

const FETCH_TIMEOUT_MS = 10_000;
const MAX_SCRIPT_SIZE = 1024 * 1024;
const VALID_CONFIG_ID = /^[A-Za-z0-9_-]{21}$/;
const ALLOWED_HOSTS = [
  "vercel-storage.com",
  "public.blob.vercel-storage.com",
];

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
  } catch {
    return new Response("Script not found", { status: 404 });
  }
}
