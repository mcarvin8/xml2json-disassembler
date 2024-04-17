"use strict";

import { ReassembleXMLFileHandler } from "xml-disassembler";

export async function reassembleHandler(
  xmlPath: string,
  fileExtension: string,
  postpurge: boolean,
): Promise<void> {
  const handler = new ReassembleXMLFileHandler();
  await handler.reassemble({
    xmlPath,
    fileExtension,
    postPurge: postpurge,
  });
}
