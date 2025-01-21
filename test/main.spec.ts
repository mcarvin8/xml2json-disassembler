import { readdir, readFile, writeFile, rm } from "node:fs/promises";
import { strictEqual } from "node:assert";
import { resolve, join } from "node:path/posix";
import { copy } from "fs-extra";

import {
  XmlToJsonDisassembler,
  JsonToXmlReassembler,
  setLogLevel,
  logger,
} from "../src/index";

setLogLevel("debug");
const baselineDir: string = "test/baselines";
const mockDir: string = "mock";
let xml2jsonDisassemblerHandler: XmlToJsonDisassembler;
let json2xmlReassemblerHandler: JsonToXmlReassembler;

describe("main function", () => {
  beforeAll(async () => {
    await copy(baselineDir, mockDir, { overwrite: true });
    xml2jsonDisassemblerHandler = new XmlToJsonDisassembler();
    json2xmlReassemblerHandler = new JsonToXmlReassembler();
  });

  beforeEach(async () => {
    jest.spyOn(logger, "error");
    jest.spyOn(logger, "warn");
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    jest.resetModules();
  });

  afterAll(async () => {
    await rm(mockDir, { recursive: true });
  });

  it("should disassemble & transform 1 XML file into JSON files.", async () => {
    await xml2jsonDisassemblerHandler.disassemble({
      filePath: "mock/HR_Admin.permissionset-meta.xml",
      uniqueIdElements:
        "application,apexClass,name,externalDataSource,flow,object,apexPage,recordType,tab,field",
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should disassemble & transform a directory of XML files into JSON files.", async () => {
    await xml2jsonDisassemblerHandler.disassemble({
      filePath: "mock",
      uniqueIdElements:
        "application,apexClass,name,externalDataSource,flow,object,apexPage,recordType,tab,field",
      prePurge: true,
      postPurge: true,
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should test ignore file.", async () => {
    await xml2jsonDisassemblerHandler.disassemble({
      filePath: "mock/ignore.xml",
    });

    expect(logger.warn).toHaveBeenCalled();
  });
  it("should reassemble the XML file.", async () => {
    await json2xmlReassemblerHandler.reassemble({
      filePath: "mock/HR_Admin",
      fileExtension: "permissionset-meta.xml",
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should reassemble the XML file with comments.", async () => {
    await json2xmlReassemblerHandler.reassemble({
      filePath: "mock/Numbers-fr",
      fileExtension: "globalValueSetTranslation-meta.xml",
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should reassemble the CDATA XML file.", async () => {
    await json2xmlReassemblerHandler.reassemble({
      filePath: "mock/VidLand_US",
      fileExtension: "marketingappextension-meta.xml",
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should reassemble the XML file with an array of leafs.", async () => {
    await json2xmlReassemblerHandler.reassemble({
      filePath: "mock/Dreamhouse",
      fileExtension: "app-meta.xml",
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should reassemble the XML file with attributes.", async () => {
    await json2xmlReassemblerHandler.reassemble({
      filePath: "mock/attributes",
    });

    expect(logger.error).not.toHaveBeenCalled();
  });
  it("should test disassemble error condition (XML file path not provided).", async () => {
    let fakeFile = "mock/not-an-xml.txt";
    fakeFile = resolve(fakeFile);
    const fakeFileContents = "Testing error condition.";
    await writeFile(fakeFile, fakeFileContents);
    await xml2jsonDisassemblerHandler.disassemble({
      filePath: fakeFile,
    });
    expect(logger.error).toHaveBeenCalled();
  });
  it("should test reassemble error condition (file path provided).", async () => {
    const fakeFile = "mock/not-an-xml.txt";
    await json2xmlReassemblerHandler.reassemble({
      filePath: fakeFile,
    });
    await rm(fakeFile);
    expect(logger.error).toHaveBeenCalled();
  });
  it("should return the minimum of available parallelism and 6", () => {
    jest.mock("node:os", () => ({
      availableParallelism: jest.fn(() => 4), // Mock availableParallelism to return 4
    }));
    const {
      getConcurrencyThreshold,
    } = require("../src/service/getConcurrencyThreshold");
    expect(getConcurrencyThreshold()).toBe(4);
  });
  it("should return 6 if availableParallelism returns a higher value", () => {
    jest.mock("node:os", () => ({
      availableParallelism: jest.fn(() => 10), // Mock availableParallelism to return 10
    }));
    const {
      getConcurrencyThreshold,
    } = require("../src/service/getConcurrencyThreshold");
    expect(getConcurrencyThreshold()).toBe(6);
  });
  it("should return 6 if availableParallelism is undefined", () => {
    jest.mock("node:os", () => ({
      availableParallelism: undefined, // Simulate unavailable function
    }));
    const {
      getConcurrencyThreshold,
    } = require("../src/service/getConcurrencyThreshold");
    expect(getConcurrencyThreshold()).toBe(6);
  });
  // This should always be the final test
  it("should compare the files created in the mock directory against the baselines to confirm no changes.", async () => {
    await compareDirectories(baselineDir, mockDir);
  });
});

async function compareDirectories(
  referenceDir: string,
  mockDir: string,
): Promise<void> {
  const entriesinRef = await readdir(referenceDir, { withFileTypes: true });

  // Only compare files that are in the reference directory
  for (const entry of entriesinRef) {
    const refEntryPath = join(referenceDir, entry.name);
    const mockPath = join(mockDir, entry.name);

    if (entry.isDirectory()) {
      // If it's a directory, recursively compare its contents
      await compareDirectories(refEntryPath, mockPath);
    } else {
      // If it's a file, compare its content
      const refContent = await readFile(refEntryPath, "utf-8");
      const mockContent = await readFile(mockPath, "utf-8");
      strictEqual(
        refContent,
        mockContent,
        `File content is different for ${entry.name}`,
      );
    }
  }
}
