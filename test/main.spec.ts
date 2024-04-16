import { writeFile, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { copy } from "fs-extra";

import { XmlToJsonDisassembler, setLogLevel, logger } from "../src/index";

setLogLevel("debug");
const baselineDir: string = "test/baselines";
const mockDir: string = "mock";
let xml2jsonDisassemblerHandler: XmlToJsonDisassembler;

describe("main function", () => {
  beforeAll(async () => {
    await copy(baselineDir, mockDir, { overwrite: true });
    xml2jsonDisassemblerHandler = new XmlToJsonDisassembler();
  });

  beforeEach(async () => {
    jest.spyOn(logger, "error");
  });

  afterEach(async () => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await rm(mockDir, { recursive: true });
  });

  it("should disassemble & transform a general XML file (folder path) into JSON files.", async () => {
    await xml2jsonDisassemblerHandler.transform({
      xmlPath: "mock",
      uniqueIdElements:
        "application,apexClass,name,externalDataSource,flow,object,apexPage,recordType,tab,field",
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should disassemble & transform a general XML file (file path) into JSON files.", async () => {
    await xml2jsonDisassemblerHandler.transform({
      xmlPath: "mock/HR_Admin.permissionset-meta.xml",
      prePurge: true,
      postPurge: true,
      uniqueIdElements:
        "application,apexClass,name,externalDataSource,flow,object,apexPage,recordType,tab,field",
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should test error condition (XML file path not provided).", async () => {
    let fakeFile = "mock/not-an-xml.txt";
    fakeFile = resolve(fakeFile);
    const fakeFileContents = "Testing error condition.";
    await writeFile(fakeFile, fakeFileContents);
    await xml2jsonDisassemblerHandler.transform({
      xmlPath: fakeFile,
    });
    await rm(fakeFile);
    expect(logger.error).toHaveBeenCalled();
  });
});
