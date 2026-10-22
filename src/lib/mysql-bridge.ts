import { createServerFn } from "@tanstack/react-start";
import type { MysqlQueryRequest } from "./mysql-api.server";

export const runMysqlQueryServerFn = createServerFn({ method: "POST" })
  .validator((d: any) => d as MysqlQueryRequest)
  .handler(async ({ data }) => {
    const { executeMysqlQuery } = await import("./mysql-api.server");
    const { userFromToken } = await import("./mysql-auth.server");
    let user = null;
    try {
      const { getRequest } = await import("@tanstack/react-start/server");
      const req = getRequest();
      const authHeader = req?.headers?.get?.("authorization") || "";
      if (authHeader) {
        user = userFromToken(authHeader);
      }
    } catch {}
    return await executeMysqlQuery(data, user);
  });

export const runMysqlRpcServerFn = createServerFn({ method: "POST" })
  .validator((d: any) => d as { fnName: string; params: Record<string, any> })
  .handler(async ({ data }) => {
    const { executeMysqlRpc } = await import("./mysql-api.server");
    return await executeMysqlRpc(data.fnName, data.params);
  });
