"use strict";

import { existsSync } from "node:fs";
import { stat, readdir } from "node:fs/promises";
import { resolve, join, basename, dirname, extname } from "node:path/posix";
import {
  getConcurrencyThreshold,
  withConcurrencyLimit,
} from "xml-disassembler";

import { logger } from "@src/index";
import { disassembleHandler } from "@src/service/disassembleHandler";
import { transform2JSON } from "@src/service/transform2JSON";

export class XmlToJsonDisassembler {
  async disassemble(xmlAttributes: {
    filePath: string;
    uniqueIdElements?: string;
    prePurge?: boolean;
    postPurge?: boolean;
    ignorePath?: string;
  }): Promise<void> {
    const {
      filePath,
      uniqueIdElements = "",
      prePurge = false,
      postPurge = false,
      ignorePath = ".xmldisassemblerignore",
    } = xmlAttributes;
    const concurrencyLimit = getConcurrencyThreshold();
    const tasks = [];
    const fileStat = await stat(filePath);

    if (fileStat.isFile()) {
      const resolvedPath = resolve(filePath);
      if (!resolvedPath.endsWith(".xml")) {
        logger.error(`The file path is not an XML file: ${resolvedPath}`);
        return;
      }
      tasks.push(() =>
        this.processFile({
          filePath: resolvedPath,
          uniqueIdElements,
          prePurge,
          postPurge,
          ignorePath,
        }),
      );
    } else if (fileStat.isDirectory()) {
      const subFiles = await readdir(filePath);
      for (const subFile of subFiles) {
        const subFilePath = join(filePath, subFile);
        if (subFilePath.endsWith(".xml")) {
          tasks.push(() =>
            this.processFile({
              filePath: subFilePath,
              uniqueIdElements,
              prePurge,
              postPurge,
              ignorePath,
            }),
          );
        }
      }
    }

    await withConcurrencyLimit(tasks, concurrencyLimit);
  }

  async processFile(xmlAttributes: {
    filePath: string;
    uniqueIdElements: string;
    prePurge: boolean;
    postPurge: boolean;
    ignorePath: string;
  }): Promise<void> {
    const { filePath, uniqueIdElements, prePurge, postPurge, ignorePath } =
      xmlAttributes;

    await disassembleHandler(
      filePath,
      uniqueIdElements,
      prePurge,
      postPurge,
      ignorePath,
    );
    const fullName = basename(filePath, extname(filePath));
    const basePath = dirname(filePath);
    const baseName = fullName.split(".")[0];
    const disassemblePath = join(basePath, baseName);
    if (existsSync(disassemblePath)) {
      await transform2JSON(disassemblePath);
    } else {
      logger.warn(
        `XML file ${filePath} was unable to disassembled into smaller files. Check the log file and your ignore file.`,
      );
    }
  }
}
