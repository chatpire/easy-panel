import { existsSync, readFileSync, writeFileSync } from "fs";

const args = process.argv.slice(2);

const dirPath = args[0] ?? process.env.ZOD_PRISMA_TYPES_DIR_PATH;

if (!dirPath) {
  console.error("Please provide zod-prisma-types generated dir path.");
  process.exit(1);
}

const filesToReplace = [`${dirPath}/index.ts`];

filesToReplace.forEach((filePath) => {
  try {
    // check if file exists
    if (!existsSync(filePath)) {
      console.error(`File does not exist: ${filePath}`);
      return;
    }
    const content = readFileSync(filePath, { encoding: "utf8" });
    const newContent = content.replace(/\.strict\(\)/g, "");
    writeFileSync(filePath, newContent, { encoding: "utf8" });

    console.log(`Completed removing .strict() from ${filePath}`);
  } catch (error) {
    console.error(`Error removing .strict() from ${filePath}:`, error);
    process.exit(1);
  }
});
