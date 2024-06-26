"use strict";

import { ReassembleXMLFileHandler } from "xml-disassembler";

export async function reassembleHandler(
  filePath: string,
  fileExtension: string,
  postpurge: boolean,
): Promise<void> {
  const handler = new ReassembleXMLFileHandler();
  await handler.reassemble({
    filePath,
    fileExtension,
    postPurge: postpurge,
  });
}
