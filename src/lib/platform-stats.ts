import { createServerFn } from "@tanstack/react-start";
import type { PublicPlatformStats } from "./platform-stats.server";

export type { PublicPlatformStats };

export const getPublicPlatformStats = createServerFn({ method: "GET" })
  .handler(async (): Promise<PublicPlatformStats> => {
    const { getPublicPlatformStatsServer } = await import("./platform-stats.server");
    return getPublicPlatformStatsServer();
  });
