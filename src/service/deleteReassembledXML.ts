"use strict";

import { readdir, rm } from "node:fs/promises";
import { join } from "node:path/posix";
import { getConcurrencyThreshold } from "./getConcurrencyThreshold";
import { withConcurrencyLimit } from "./withConcurrencyLimit";

export async function deleteReassembledXML(
  disassembledPath: string,
): Promise<void> {
  const tasks: (() => Promise<void>)[] = [];
  const files = await readdir(disassembledPath, { withFileTypes: true });
  const concurrencyLimit = getConcurrencyThreshold();

  for (const file of files) {
    const subFilePath = join(disassembledPath, file.name);

    if (file.isFile() && subFilePath.endsWith(".xml")) {
      tasks.push(() => rm(subFilePath));
    } else if (file.isDirectory()) {
      tasks.push(() => deleteReassembledXML(subFilePath));
    }
  }
  await withConcurrencyLimit(tasks, concurrencyLimit);
}
