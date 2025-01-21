"use strict";

import { stat, readdir } from "node:fs/promises";
import { join } from "node:path/posix";

import { logger } from "@src/index";
import { reassembleHandler } from "@src/service/reassembleHandler";
import { transform2XML } from "@src/service/transform2XML";
import { deleteReassembledXML } from "@src/service/deleteReassembledXML";
import { withConcurrencyLimit } from "./withConcurrencyLimit";
import { getConcurrencyThreshold } from "./getConcurrencyThreshold";

export class JsonToXmlReassembler {
  async reassemble(xmlAttributes: {
    filePath: string;
    fileExtension?: string;
    postPurge?: boolean;
  }): Promise<void> {
    const {
      filePath,
      fileExtension = "xml",
      postPurge = false,
    } = xmlAttributes;
    const fileStat = await stat(filePath);

    if (fileStat.isFile()) {
      logger.error(`The path ${filePath} is not a directory.`);
      return;
    } else if (fileStat.isDirectory()) {
      await this.processFile(filePath);
    }

    await reassembleHandler(filePath, fileExtension, postPurge);
    // delete XML files created during reassembly - this is needed if postPurge is false
    if (!postPurge) await deleteReassembledXML(filePath);
  }

  async processFile(filePath: string): Promise<void> {
    const tasks: (() => Promise<void>)[] = [];
    const files = await readdir(filePath, { withFileTypes: true });
    const concurrencyLimit = getConcurrencyThreshold();

    for (const file of files) {
      const subFilePath = join(filePath, file.name);

      if (file.isFile() && subFilePath.endsWith(".json")) {
        tasks.push(() => transform2XML(subFilePath));
      } else if (file.isDirectory()) {
        tasks.push(() => this.processFile(subFilePath));
      }
    }
    await withConcurrencyLimit(tasks, concurrencyLimit);
  }
}
