import "./lib/env.server";
import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

// Periodically mark stale login sessions offline (every 5 minutes)
if (typeof setInterval !== "undefined") {
  const STALE_TIMEOUT = 15 * 60 * 1000; // 15 minutes
  setInterval(async () => {
    try {
      const { dbQuery } = await import("./lib/db.server");
      const cutoff = new Date(Date.now() - STALE_TIMEOUT)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      await dbQuery(
        "UPDATE login_sessions SET status = 'offline' WHERE status = 'online' AND last_active < ?",
        [cutoff]
      );
    } catch (e) {
      console.error("[Cleanup] Failed to mark stale sessions:", e);
    }
  }, 5 * 60 * 1000);
}

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      if (url.pathname === "/ads.txt" || url.pathname === "/ads.txt/") {
        return new Response("google.com, pub-5755024838228586, DIRECT, f08c47fec0942fa0\n", {
          status: 200,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
            "Pragma": "no-cache",
            "Expires": "0",
          },
        });
      }

      if (url.pathname === "/api/webhooks/cashfree") {
        const { handleCashfreeWebhook } = await import("./lib/cashfree-webhook.server");
        return await handleCashfreeWebhook(request);
      }

      const { handleMysqlServerApi } = await import("./lib/server-api-router.server");
      const apiResponse = await handleMysqlServerApi(request, url);
      if (apiResponse) {
        return apiResponse;
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);

      // Enforce zero-cache on HTML documents so users and admins always get the latest bundle immediately
      if ((normalized.headers.get("content-type") || "").includes("text/html")) {
        const headers = new Headers(normalized.headers);
        headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
        headers.set("Pragma", "no-cache");
        headers.set("Expires", "0");

        if (url.hostname.includes("skyrovix.in") && normalized.status === 200) {
          const html = await normalized.text();
          const updatedHtml = html
            .replaceAll('href="https://skyrovix.online"', 'href="https://skyrovix.in"')
            .replaceAll('content="https://skyrovix.online"', 'content="https://skyrovix.in"')
            .replaceAll('href="https://skyrovix.online/', 'href="https://skyrovix.in/')
            .replaceAll('content="https://skyrovix.online/', 'content="https://skyrovix.in/');
          return new Response(updatedHtml, {
            status: normalized.status,
            headers,
          });
        }

        return new Response(normalized.body, {
          status: normalized.status,
          headers,
        });
      }

      return normalized;
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
