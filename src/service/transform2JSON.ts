"use strict";

import { readdir, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path/posix";
import { parseXML } from "xml-disassembler";

import { logger } from "@src/index";

export async function transform2JSON(xmlPath: string): Promise<void> {
  const subFiles = await readdir(xmlPath);
  for (const subFile of subFiles) {
    const subFilePath = join(xmlPath, subFile);
    if ((await stat(subFilePath)).isDirectory()) {
      await transform2JSON(subFilePath);
    } else if (
      (await stat(subFilePath)).isFile() &&
      subFilePath.endsWith(".xml")
    ) {
      await writeJSON(subFilePath);
      await rm(subFilePath);
    }
  }
}

async function writeJSON(xmlPath: string): Promise<void> {
  const parsedXml = await parseXML(xmlPath);
  const jsonString = JSON.stringify(parsedXml, null, 2);
  const jsonPath = xmlPath.replace(/\.xml$/, ".json");
  await writeFile(jsonPath, jsonString);
  logger.debug(`${xmlPath} has been transformed into ${jsonPath}`);
}
