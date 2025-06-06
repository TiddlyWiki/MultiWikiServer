import "./global";
import { PrismaClient } from "@prisma/client/extension";
import { serverEvents, Z2 } from "@tiddlywiki/server";
import { Debug } from "@prisma/client/runtime/library";
import { SqliteAdapter } from "./db/sqlite-adapter";
import { prismaField } from "./zodAssert";

export * from "@prisma/client";
export * from "./db/sqlite-adapter";

declare module "@tiddlywiki/server" {
  interface Router {
    adapter: SqliteAdapter;
    engine: PrismaEngineClient;
  }
  interface ServerEventsMap {
    "prisma.init.before": [adapter: SqliteAdapter];
    "prisma.init.after": [adapter: SqliteAdapter];
  }
}

export async function createPrismaClient(storePath: string, devMode: boolean): Promise<PrismaEngineClient> {
  const adapter = new SqliteAdapter(storePath, devMode);
  await serverEvents.emitAsync("prisma.init.before", adapter);
  await adapter.init();
  await serverEvents.emitAsync("prisma.init.after", adapter);
  return new PrismaClient({
    log: [...Debug.enabled("prisma:query") ? ["query" as const] : [], "info", "warn"],
    adapter: adapter.adapter
  });
}

serverEvents.on("zod.make", (zod: Z2<any>) => {
  zod.prismaField = prismaField;
});

