"use strict";

import { stat, readdir } from "node:fs/promises";
import { resolve, join, basename, dirname, extname } from "node:path";

import { logger } from "@src/index";
import { disassembleHandler } from "@src/service/disassembleHandler";
import { transform2JSON } from "@src/service/transform2JSON";

export class XmlToJsonDisassembler {
  async disassemble(xmlAttributes: {
    xmlPath: string;
    uniqueIdElements?: string;
    prePurge?: boolean;
    postPurge?: boolean;
  }): Promise<void> {
    const {
      xmlPath,
      uniqueIdElements = "",
      prePurge = false,
      postPurge = false,
    } = xmlAttributes;
    const fileStat = await stat(xmlPath);

    if (fileStat.isFile()) {
      const filePath = resolve(xmlPath);
      if (!filePath.endsWith(".xml")) {
        logger.error(`The file path ${filePath} is not an XML file.`);
        return;
      }
      await this.processFile({
        filePath,
        uniqueIdElements,
        prePurge,
        postPurge,
      });
    } else if (fileStat.isDirectory()) {
      const files = await readdir(xmlPath);
      for (const file of files) {
        const filePath = join(xmlPath, file);
        if (filePath.endsWith(".xml")) {
          await this.processFile({
            filePath,
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
