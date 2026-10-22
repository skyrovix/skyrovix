import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { verifyJwtToken } from "@/lib/mysql-auth.server";
import { dbClient } from "@/lib/db-client";

// Global client functionMiddleware: attaches Bearer token to serverFn RPC headers
export const attachAuthToken = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    const { data } = await dbClient.auth.getSession();
    const token = data.session?.access_token;
    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }
);

export const attachSupabaseAuth = attachAuthToken;

// Server functionMiddleware: validates Bearer token on protected server functions
export const requireAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const request = getRequest();

    if (!request?.headers) {
      throw new Error("Unauthorized: No request headers available");
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Unauthorized: No bearer token provided");
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const claims = verifyJwtToken(token);
    if (!claims || !claims.sub) {
      throw new Error("Unauthorized: Invalid or expired token");
    }

    return next({
      context: {
        userId: claims.sub,
        claims,
      },
    });
  }
);

export const requireSupabaseAuth = requireAuth;
