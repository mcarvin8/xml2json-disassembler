import { getLogger, configure } from "log4js";
export { XmlToJsonDisassembler } from "./service/xml2jsonDisassembler";
export { JsonToXmlReassembler } from "./service/json2xmlReassembler";

export const logger = getLogger();

export function setLogLevel(level: string) {
  getLogger().level = level;
}

configure({
  appenders: { disassemble: { type: "file", filename: "disassemble.log" } },
  categories: { default: { appenders: ["disassemble"], level: "error" } },
});
