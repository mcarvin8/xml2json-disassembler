"use strict";

import { stat, readdir } from "node:fs/promises";
import { join } from "node:path";

import { logger } from "@src/index";
import { reassembleHandler } from "@src/service/reassembleHandler";
import { transform2XML } from "@src/service/transform2XML";
import { deleteReassembledXML } from "@src/service/deleteReassembledXML";

export class JsonToXmlReassembler {
  async reassemble(xmlAttributes: {
    jsonPath: string;
    fileExtension?: string;
    postPurge?: boolean;
  }): Promise<void> {
    const {
      jsonPath,
      fileExtension = "xml",
      postPurge = false,
    } = xmlAttributes;
    const fileStat = await stat(jsonPath);

    if (fileStat.isFile()) {
      logger.error(`The path ${jsonPath} is not a directory.`);
      return;
    } else if (fileStat.isDirectory()) {
      await this.processFile(jsonPath);
    }

    await reassembleHandler(jsonPath, fileExtension, postPurge);
    // delete XML files created during reassembly - this is needed if postPurge is false
    if (!postPurge) await deleteReassembledXML(jsonPath);
  }

  async processFile(jsonPath: string): Promise<void> {
    const files = await readdir(jsonPath);
    for (const file of files) {
      const filePath = join(jsonPath, file);
      const fileStat = await stat(filePath);
      if (fileStat.isFile() && filePath.endsWith(".json")) {
        await transform2XML(filePath);
      } else if (fileStat.isDirectory()) {
        await this.processFile(filePath);
      }
    }
  }
}
