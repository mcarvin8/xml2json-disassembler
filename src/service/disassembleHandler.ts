"use strict";

import { DisassembleXMLFileHandler } from "xml-disassembler";

export async function disassembleHandler(
  xmlPath: string,
  uniqueIdElements: string,
  prePurge: boolean,
  postPurge: boolean,
): Promise<void> {
  const handler = new DisassembleXMLFileHandler();
  await handler.disassemble({
    xmlPath,
    uniqueIdElements,
    prePurge,
    postPurge,
  });
}
