import { spawn } from "node:child_process";
import { watch } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const schemaPath = resolve(__dirname, "../src/db/prisma/schema.prisma");

const run = (command: string, args: string[]): Promise<void> =>
  new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd: resolve(__dirname, ".."),
      stdio: "inherit",
      shell: false,
      env: process.env,
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }
      rejectPromise(new Error(`${command} ${args.join(" ")} exited with code ${code ?? "null"}`));
    });

    child.on("error", rejectPromise);
  });

let syncing = false;
let queued = false;

const syncPrisma = async (): Promise<void> => {
  if (syncing) {
    queued = true;
    return;
  }

  syncing = true;
  try {
    console.log("[watch-prisma] syncing schema");
    await run("npx", [
      "prisma",
      "db",
      "push",
      "--schema",
      "src/db/prisma/schema.prisma",
      "--accept-data-loss",
    ]);
    await run("npx", ["prisma", "generate", "--schema", "src/db/prisma/schema.prisma"]);
    console.log("[watch-prisma] schema synced");
  } catch (error) {
    console.error("[watch-prisma] sync failed", error);
  } finally {
    syncing = false;
    if (queued) {
      queued = false;
      void syncPrisma();
    }
  }
};

void syncPrisma();

watch(schemaPath, { persistent: true }, () => {
  void syncPrisma();
});

console.log(`[watch-prisma] watching ${schemaPath}`);
