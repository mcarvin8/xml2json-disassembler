"use strict";

import { readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path/posix";
import {
  parseXML,
  getConcurrencyThreshold,
  withConcurrencyLimit,
} from "xml-disassembler";

import { logger } from "@src/index";

export async function transform2JSON(xmlPath: string): Promise<void> {
  const tasks: (() => Promise<void>)[] = [];
  const files = await readdir(xmlPath, { withFileTypes: true });
  const concurrencyLimit = getConcurrencyThreshold();
  const foldersToRemote = [];

  for (const subFile of files) {
    const subFilePath = join(xmlPath, subFile.name);
    if (subFile.isDirectory()) {
      tasks.push(() => transform2JSON(subFilePath));
    } else if (subFile.isFile() && subFilePath.endsWith(".xml")) {
      tasks.push(() => writeJSON(subFilePath));
      foldersToRemote.push(subFilePath);
    }
  }
  await withConcurrencyLimit(tasks, concurrencyLimit);
  const deleteTasks = foldersToRemote.map((filePath) => () => rm(filePath));
  await withConcurrencyLimit(deleteTasks, concurrencyLimit);
}

async function writeJSON(xmlPath: string): Promise<void> {
  const parsedXml = await parseXML(xmlPath);
  const jsonString = JSON.stringify(parsedXml, null, 2);
  const jsonPath = xmlPath.replace(/\.xml$/, ".json");
  await writeFile(jsonPath, jsonString);
  logger.debug(`${xmlPath} has been transformed into ${jsonPath}`);
}
