"use strict";

import { existsSync } from "node:fs";
import { stat, readdir, readFile } from "node:fs/promises";
import {
  resolve,
  join,
  basename,
  dirname,
  extname,
  relative,
} from "node:path/posix";
import ignore, { Ignore } from "ignore";

import { logger } from "@src/index";
import { disassembleHandler } from "@src/service/disassembleHandler";
import { transform2JSON } from "@src/service/transform2JSON";

export class XmlToJsonDisassembler {
  private ign: Ignore = ignore();

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
    const resolvedIgnorePath = resolve(ignorePath);
    if (existsSync(resolvedIgnorePath)) {
      const content = await readFile(resolvedIgnorePath);
      this.ign.add(content.toString());
    }

    const fileStat = await stat(filePath);

    if (fileStat.isFile()) {
      const resolvedPath = resolve(filePath);
      if (!resolvedPath.endsWith(".xml")) {
        logger.error(`The file path  is not an XML file: ${resolvedPath}`);
        return;
      }
      if (this.ign.ignores(filePath)) {
        logger.warn(`File ignored by ${ignorePath}: ${resolvedPath}`);
        return;
      }
      await this.processFile({
        filePath: resolvedPath,
        uniqueIdElements,
        prePurge,
        postPurge,
        ignorePath,
      });
    } else if (fileStat.isDirectory()) {
      const subFiles = await readdir(filePath);
      const resolvedBasePath = dirname(resolvedIgnorePath); // Base path of the ignore file
      for (const subFile of subFiles) {
        const subFilePath = join(filePath, subFile);
        const relativeSubFilePath = this.posixPath(
          relative(resolvedBasePath, subFilePath),
        );
        if (
          subFilePath.endsWith(".xml") &&
          !this.ign.ignores(relativeSubFilePath)
        ) {
          await this.processFile({
            filePath: subFilePath,
            uniqueIdElements,
            prePurge,
            postPurge,
            ignorePath,
          });
        } else if (this.ign.ignores(relativeSubFilePath)) {
          logger.warn(`File ignored by ${ignorePath}: ${subFilePath}`);
        }
      }
    }
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
    await transform2JSON(join(basePath, baseName));
  }
  private posixPath(path: string): string {
    // Normalize path to POSIX-style (for cross-platform compatibility)
    return path.replace(/\\+/g, "/");
  }
}
