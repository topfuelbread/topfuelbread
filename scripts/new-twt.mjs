import { mkdir, writeFile, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const now = new Date();

const yyyy = String(now.getFullYear());
const mm = String(now.getMonth() + 1).padStart(2, "0");
const dd = String(now.getDate()).padStart(2, "0");
const hhmm = `${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;

const relativePath = join("src", "content", "twt", yyyy, mm, dd, `${hhmm}.md`);
const filePath = join(root, relativePath);

try {
  await access(filePath);
  console.error(`Already exists: ${relativePath.replace(/\\/g, "/")}`);
  process.exit(1);
} catch {
  // file does not exist
}

const content = `---
title: ""
tags: ["twt"]
---

`;

await mkdir(dirname(filePath), { recursive: true });
await writeFile(filePath, content, "utf8");

console.log(`Created ${relativePath.replace(/\\/g, "/")}`);
