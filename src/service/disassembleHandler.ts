"use strict";

import { DisassembleXMLFileHandler } from "xml-disassembler";

export async function disassembleHandler(
  filePath: string,
  uniqueIdElements: string,
  prePurge: boolean,
  postPurge: boolean,
  ignorePath: string,
): Promise<void> {
  const handler = new DisassembleXMLFileHandler();
  await handler.disassemble({
    filePath,
    uniqueIdElements,
    prePurge,
    postPurge,
    ignorePath,
  });
}
