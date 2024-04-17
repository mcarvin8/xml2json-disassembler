"use strict";

import { readFile, writeFile } from "node:fs/promises";
import { XMLBuilder } from "fast-xml-parser";

import { logger } from "@src/index";
import { JSON_PARSER_OPTION, INDENT } from "@src/helpers/types";

export async function transform2XML(
  jsonPath: string,
  indentLevel: number = 0,
): Promise<void> {
  const jsonString = await readFile(jsonPath, "utf-8");
  const jsonObject = JSON.parse(jsonString);

  // Remove XML declaration from JSON string
  const xmlBuilder = new XMLBuilder(JSON_PARSER_OPTION);
  const xmlString = xmlBuilder.build(jsonObject) as string;

  // Manually format the XML string with the desired indentation
  const formattedXml: string = xmlString
    .split("\n")
    .map((line: string) => `${" ".repeat(indentLevel * INDENT.length)}${line}`)
    .join("\n")
    .trimEnd();

  const xmlPath = jsonPath.replace(/\.json$/, ".xml");
  await writeFile(xmlPath, formattedXml);
  logger.debug(`${jsonPath} has been transformed into ${xmlPath}`);
}
