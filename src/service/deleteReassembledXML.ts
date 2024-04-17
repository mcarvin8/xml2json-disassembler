"use strict";

import { stat, readdir, rm } from "node:fs/promises";
import { join } from "node:path";

export async function deleteReassembledXML(
  disassembledPath: string,
): Promise<void> {
  const files = await readdir(disassembledPath);
  for (const file of files) {
    const filePath = join(disassembledPath, file);
    const fileStat = await stat(filePath);
    if (fileStat.isFile() && filePath.endsWith(".xml")) {
      await rm(filePath);
    } else if (fileStat.isDirectory()) {
      await deleteReassembledXML(filePath);
    }
  }
}
