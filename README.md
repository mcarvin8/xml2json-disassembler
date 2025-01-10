# XML2JSON Disassembler

[![NPM](https://img.shields.io/npm/v/xml2json-disassembler.svg?label=xml2json-disassembler)](https://www.npmjs.com/package/xml2json-disassembler) [![Downloads/week](https://img.shields.io/npm/dw/xml2json-disassembler.svg)](https://npmjs.org/package/xml2json-disassembler)

A JavaScript package to disassemble then transform XML files into smaller JSON files. This is an extension of my [XML Disassembler](https://github.com/mcarvin8/xml-disassembler) package.

## Background

Large XML files can be a pain to mantain in version control. These files can contain thousands of lines and it becomes very difficult to track changes made to these files in a standard version control server like GitHub.

This package offers a way to break down large XML files into smaller JSON files which can be used to review changes in a format easier to digest. When needed, the inverse class will reassemble the original XML file from the smaller JSON files.

This will parse and retain the following XML elements:

- CDATA sections (`"![CDATA["`)
- Comments (`"!---"`)
- Attributes (`"@__**"`)

## Install

Install the package using NPM:

```
npm install xml2json-disassembler
```

## Usage

### XML 2 JSON

```typescript
/* 
FLAGS
- filePath: Relative path to 1 XML file or a directory of XML files to disassemble, then transform into JSON files. If the path provided is a directory, only the files in the immediate directory will be disassembled and transformed.
- uniqueIdElements: (Optional) Comma-separated list of unique and required ID elements used to name disassembled files for nested elements. 
                               Defaults to SHA-256 hash if unique ID elements are undefined or not found.
- prePurge:  (Optional) Boolean value. If set to true, purge pre-existing transformed directories prior to disassembling and transformed the file.
                               Defaults to false.
- postPurge: (Optional) Boolean value. If set to true, purge the original XML file after transforming it into smaller JSON files.
                               Defaults to false.
- ignorePath: (Optional) Path to an ignore file containing XML files to ignore during disassembly. See "Ignore File" section.
*/
import { XmlToJsonDisassembler } from "xml2json-disassembler";

const handler = new XmlToJsonDisassembler();
await handler.disassemble({
  filePath: "test/baselines/general",
  uniqueIdElements:
    "application,apexClass,name,externalDataSource,flow,object,apexPage,recordType,tab,field",
  prePurge: true,
  postPurge: true,
  ignorePath: ".xmldisassemblerignore",
});
```

Disassemble then transform 1 or multiple XML files into JSON files. Paths provided must be **relative** paths. If the `filePath` is a directory, only the XMLs in the immediate directory will be processed. Each XML wiill be transformed into JSON files in new sub-directories using the XML's base name (everything before the first period in the file-name).

Example:

An XML file (`HR_Admin.permissionset-meta.xml`) with the following nested and leaf elements

```xml
<?xml version="1.0" encoding="UTF-8"?>
<PermissionSet xmlns="http://soap.sforce.com/2006/04/metadata">
    <applicationVisibilities>
        <application>JobApps__Recruiting</application>
        <visible>true</visible>
    </applicationVisibilities>
    <classAccesses>
        <apexClass>Send_Email_Confirmation</apexClass>
        <enabled>true</enabled>
    </classAccesses>
    <fieldPermissions>
        <editable>true</editable>
        <field>Job_Request__c.Salary__c</field>
        <readable>true</readable>
    </fieldPermissions>
    <description>Grants all rights needed for an HR administrator to manage employees.</description>
    <label>HR Administration</label>
    <userLicense>Salesforce</userLicense>
    <objectPermissions>
        <allowCreate>true</allowCreate>
        <allowDelete>true</allowDelete>
        <allowEdit>true</allowEdit>
        <allowRead>true</allowRead>
        <viewAllRecords>true</viewAllRecords>
        <modifyAllRecords>true</modifyAllRecords>
        <object>Job_Request__c</object>
    </objectPermissions>
    <pageAccesses>
        <apexPage>Job_Request_Web_Form</apexPage>
        <enabled>true</enabled>
    </pageAccesses>
    <recordTypeVisibilities>
        <recordType>Recruiting.DevManager</recordType>
        <visible>true</visible>
    </recordTypeVisibilities>
    <tabSettings>
        <tab>Job_Request__c</tab>
        <visibility>Available</visibility>
    </tabSettings>
    <userPermissions>
        <enabled>true</enabled>
        <name>APIEnabled</name>
    </userPermissions>
</PermissionSet>
```

will be disassembled into a sub-directory named `HR_Admin` as such:

- Each nested element (`<recordTypeVisibilities>`, `<applicationVisibilities>`, `pageAccesses`, etc.) will be disassembled into further sub-directories by the nested element name. If a unique & required ID element (`application` is the unique ID element for `<applicationVisibilities>`) is found, the disassembled file will be named using it. Otherwise, the disassembled files for nested elements will be named using the SHA-256 of the element contents.
- Each leaf element (`<description>`, `<label>`, `<userLicense>`) will be disassembled into the same file in the first sub-directory, which will have the same file-name as the original file.

<img src="https://raw.githubusercontent.com/mcarvin8/xml2json-disassembler/main/.github/images/disassembled.png">

<br>

<img src="https://raw.githubusercontent.com/mcarvin8/xml2json-disassembler/main/.github/images/disassembled-hashes.png">

<br>

### JSON 2 XML

```typescript
/* 
FLAGS
- filePath: Relative path to the directory containing the JSON files to reassemble into 1 XML file (must be a directory).
- fileExtension: (Optional) Desired file extension for the final XML (default: `.xml`).
- postPurge: (Optional) Boolean value. If set to true, purge the disassembled directory containing JSON files after the XML is reassembled.
                               Defaults to false.
*/
import { JsonToXmlReassembler } from "xml2json-disassembler";

const handler = new JsonToXmlReassembler();
await handler.reassemble({
  filePath: "test/baselines/HR_Admin",
  fileExtension: "permissionset-meta.xml",
  postPurge: true,
});
```

Reassemble all of the JSON files in a directory into 1 XML file. Path provided must be **relative** path. **Note:** You should only be reassembling JSON files created by the `XmlToJsonDisassembler` class for intended results. The reassembled XML file will be created in the parent directory of `filePath` and will overwrite the original file used to create the original disassembled directories, if it still exists and the `fileExtension` flag matches the original file extension.

## Ignore File

If you wish, you can create an ignore file to have the disassembler ignore specific XMLs similar to a `.gitignore` file.

The disassembler uses the [node-ignore](https://github.com/kaelzhang/node-ignore) package to parse ignore files that follow [.gitignore spec 2.22.1](https://git-scm.com/docs/gitignore).

By default, the XML disassembler will look for an ignore file named `.xmldisassemblerignore` in the current working directory. Set the `ignorePath` flag to override this ignore path when running the XmlToJsonDisassembler class.

## Logging

By default, the package will not print any debugging statements to the console. Any error or debugging statements will be added to a log file, `disassemble.log`, created in the same directory you are running this package in. This file will be created when running the package in all cases, even if there are no errors. I recommend adding `disassemble.log` to your `.gitignore` file.

This log will include the results of this package and the XML Disassembler package.

The logger's default state is to only log errors to `disassemble.log`. Check this file for ERROR statements that will look like:

```
[2024-03-30T14:28:37.950] [ERROR] default - The XML file HR_Admin.no-nested-elements.xml only has leaf elements. This file will not be disassembled.
[2024-04-16T14:55:27.170] [ERROR] default - The file path C:\Users\matthew.carvin\Documents\xml2json-disassembler\test\baselines\not-an-xml.txt is not an XML file.
```

To add additional debugging statements to the log file, import the `setLogLevel` function from the package and run the function with `debug` to print all debugging statements to a log file.

When the log level is set to `debug`, the log file will contain statements like this to indicate which files were processed for disassembly and reassembly:

```
[2024-04-16T14:56:29.665] [DEBUG] default - Parsing file to disassemble: C:\Users\matthew.carvin\Documents\xml2json-disassembler\test\baselines\general\attributes.xml
[2024-04-16T14:56:29.675] [DEBUG] default - Created disassembled file: C:\Users\matthew.carvin\Documents\xml2json-disassembler\test\baselines\general\attributes\nest\103c6c8b.nest-meta.xml
[2024-04-16T14:56:29.676] [DEBUG] default - Created disassembled file: C:\Users\matthew.carvin\Documents\xml2json-disassembler\test\baselines\general\attributes\nest\f876f2be.nest-meta.xml
[2024-04-16T14:56:29.682] [DEBUG] default - test\baselines\general\attributes\nest\103c6c8b.nest-meta.xml has been transformed into test\baselines\general\attributes\nest\103c6c8b.nest-meta.json
[2024-04-16T14:56:29.687] [DEBUG] default - test\baselines\general\attributes\nest\f876f2be.nest-meta.xml has been transformed into test\baselines\general\attributes\nest\f876f2be.nest-meta.json
```

```typescript
import {
  XmlToJsonDisassembler,
  JsonToXmlReassembler,
  setLogLevel,
} from "xml2json-disassembler";

setLogLevel("debug");

const disassembleHandler = new XmlToJsonDisassembler();
await disassembleHandler.disassemble({
  filePath: "test/baselines/general",
  uniqueIdElements:
    "application,apexClass,name,externalDataSource,flow,object,apexPage,recordType,tab,field",
  prePurge: true,
  postPurge: true,
});

const reassembleHandler = new JsonToXmlReassembler();
await reassembleHandler.reassemble({
  filePath: "test/baselines/HR_Admin",
  fileExtension: "permissionset-meta.xml",
  postPurge: true,
});
```

## Template

This project was created from a template provided by [Allan Oricil](https://github.com/AllanOricil).

His original [license](https://github.com/AllanOricil/js-template/blob/main/LICENSE) remains in this project.
