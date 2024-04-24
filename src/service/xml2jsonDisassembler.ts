"use strict";

import { stat, readdir } from "node:fs/promises";
import { resolve, join, basename, dirname, extname } from "node:path";

import { logger } from "@src/index";
import { disassembleHandler } from "@src/service/disassembleHandler";
import { transform2JSON } from "@src/service/transform2JSON";

export class XmlToJsonDisassembler {
  async disassemble(xmlAttributes: {
    filePath: string;
    uniqueIdElements?: string;
    prePurge?: boolean;
    postPurge?: boolean;
  }): Promise<void> {
    const {
      filePath,
      uniqueIdElements = "",
      prePurge = false,
      postPurge = false,
    } = xmlAttributes;
    const fileStat = await stat(filePath);

    if (fileStat.isFile()) {
      const resolvedPath = resolve(filePath);
      if (!resolvedPath.endsWith(".xml")) {
        logger.error(`The file path  is not an XML file: ${resolvedPath}`);
        return;
      }
      await this.processFile({
        filePath: resolvedPath,
        uniqueIdElements,
        prePurge,
        postPurge,
      });
    } else if (fileStat.isDirectory()) {
      const subFiles = await readdir(filePath);
      for (const subFile of subFiles) {
        const subFilePath = join(filePath, subFile);
        if (subFilePath.endsWith(".xml")) {
          await this.processFile({
            filePath: subFilePath,
            uniqueIdElements,
            prePurge,
            postPurge,
          });
        }
      }
    }
  }

  async processFile(xmlAttributes: {
    filePath: string;
    uniqueIdElements: string;
    prePurge: boolean;
    postPurge: boolean;
  }): Promise<void> {
    const { filePath, uniqueIdElements, prePurge, postPurge } = xmlAttributes;

    await disassembleHandler(filePath, uniqueIdElements, prePurge, postPurge);
    const fullName = basename(filePath, extname(filePath));
    const basePath = dirname(filePath);
    const baseName = fullName.split(".")[0];
    await transform2JSON(join(basePath, baseName));
  }
}
