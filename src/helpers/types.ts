"use strict";

export const XML_PARSER_OPTION = {
  commentPropName: "!---",
  ignoreAttributes: false,
  ignoreNameSpace: false,
  parseTagValue: false,
  parseNodeValue: false,
  parseAttributeValue: false,
  trimValues: true,
  processEntities: false,
  cdataPropName: "![CDATA[",
};

export interface XmlElement {
  [key: string]: string | XmlElement | string[] | XmlElement[];
}
