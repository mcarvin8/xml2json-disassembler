"use strict";

import { readFile, writeFile } from "node:fs/promises";
import { buildXMLString } from "xml-disassembler";

import { logger } from "@src/index";

export async function transform2XML(
  jsonPath: string,
  indentLevel: number = 0,
): Promise<void> {
  const jsonString = await readFile(jsonPath, "utf-8");
  const jsonObject = JSON.parse(jsonString);

  // Remove XML declaration from JSON string
  const formattedXml = buildXMLString(jsonObject, indentLevel);

  const xmlPath = jsonPath.replace(/\.json$/, ".xml");
  await writeFile(xmlPath, formattedXml);
  logger.debug(`${jsonPath} has been transformed into ${xmlPath}`);
}
