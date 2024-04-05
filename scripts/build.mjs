import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["scripts/create-admin.ts", "scripts/db-migrate.ts"],
  bundle: true,
  platform: "node",
  outdir: "scripts-dist",
  format: "cjs",
  loader: { ".node": "copy" },
});

// rename .js to .cjs
import { renameSync } from "fs";
renameSync("scripts-dist/create-admin.js", "scripts-dist/create-admin.cjs");
renameSync("scripts-dist/db-migrate.js", "scripts-dist/db-migrate.cjs");
