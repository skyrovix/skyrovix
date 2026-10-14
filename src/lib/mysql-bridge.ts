import { createServerFn } from "@tanstack/react-start";
import type { MysqlQueryRequest } from "./mysql-api.server";

export const runMysqlQueryServerFn = createServerFn({ method: "POST" })
  .validator((d: any) => d as MysqlQueryRequest)
  .handler(async ({ data }) => {
    const { executeMysqlQuery } = await import("./mysql-api.server");
    return await executeMysqlQuery(data);
  });

export const runMysqlRpcServerFn = createServerFn({ method: "POST" })
  .validator((d: any) => d as { fnName: string; params: Record<string, any> })
  .handler(async ({ data }) => {
    const { executeMysqlRpc } = await import("./mysql-api.server");
    return await executeMysqlRpc(data.fnName, data.params);
  });
