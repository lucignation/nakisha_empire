import { createRequire } from "node:module";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

const require = createRequire(import.meta.url);

// `ws` tries to load optional native helpers that can break under Next's server bundling.
// For Neon queries in the admin runtime, the pure-JS path is safer and avoids `bufferUtil.mask`.
process.env.WS_NO_BUFFER_UTIL = "1";
process.env.WS_NO_UTF_8_VALIDATE = "1";

const wsPackage = require("ws") as typeof import("ws");
const WebSocketConstructor = wsPackage.WebSocket ?? wsPackage;

function createPrismaClient() {
  neonConfig.webSocketConstructor = WebSocketConstructor;
  const connectionString = process.env.DATABASE_URL ?? "postgresql://placeholder:placeholder@localhost:5432/placeholder";
  const adapter = new PrismaNeon({
    connectionString
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });
}

export const prisma = globalThis.prismaGlobal ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}
