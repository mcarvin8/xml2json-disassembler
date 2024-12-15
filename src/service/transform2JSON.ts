"use strict";

import { readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path/posix";
import { XMLParser } from "fast-xml-parser";

import { logger } from "@src/index";
import { XML_PARSER_OPTION, XmlElement } from "@src/helpers/types";

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
  const xmlParser = new XMLParser(XML_PARSER_OPTION);
  const xmlContent = await readFile(xmlPath, "utf-8");
  const xmlParsed = xmlParser.parse(xmlContent, true) as Record<
    string,
    XmlElement
  >;
  const jsonString = JSON.stringify(xmlParsed, null, 2);
  const jsonPath = xmlPath.replace(/\.xml$/, ".json");
  await writeFile(jsonPath, jsonString);
  logger.debug(`${xmlPath} has been transformed into ${jsonPath}`);
}
