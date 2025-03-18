# `xml2json-disassembler`

[![NPM](https://img.shields.io/npm/v/xml2json-disassembler.svg?label=xml2json-disassembler)](https://www.npmjs.com/package/xml2json-disassembler) [![Downloads/week](https://img.shields.io/npm/dw/xml2json-disassembler.svg)](https://npmjs.org/package/xml2json-disassembler)

Disassemble XML files into smaller, more manageable JSON files and reassemble the XML when needed. This is an extension of [`xml-disassembler`](https://github.com/mcarvin8/xml-disassembler).

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
  - [XML2JSON](#xml2json)
  - [JSON2XML](#json2xml)
- [Example](#example)
- [Ignore File](#ignore-file)
- [Logging](#logging)
- [Contributing](#contributing)
- [Template](#template)
</details>

## Background

Large XML files can be a pain to mantain in version control. These files can contain thousands of lines and it becomes very difficult to track changes made to these files in a standard version control server like GitHub.

This package offers a way to break down large XML files into smaller JSON files which can be used to review changes in a format easier to digest. When needed, the inverse class will reassemble the original XML file from the smaller JSON files.

## Install

Install the package using NPM:

```
npm install xml2json-disassembler
```

## Usage

### XML2JSON

Disassemble then transform 1 or multiple XML files in the root of a directory into JSON files. Paths provided must be **relative** paths.

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

### JSON2XML

Reassemble all of the JSON files in a directory into 1 XML file. Path provided must be **relative** path. 

> **Note:** You should only be reassembling JSON files created by the `XmlToJsonDisassembler` class for intended results. The reassembled XML file will be created in the parent directory of `filePath` and will overwrite the original file used to create the original disassembled directories, if it still exists and the `fileExtension` flag matches the original file extension.

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

## Example

**XML file (`HR_Admin.permissionset-meta.xml`)**

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

**Disassembled JSON Files**

<img src="https://raw.githubusercontent.com/mcarvin8/xml2json-disassembler/main/.github/images/disassembled.png">

<br>

<img src="https://raw.githubusercontent.com/mcarvin8/xml2json-disassembler/main/.github/images/disassembled-hashes.png">

<br>

## Ignore File

Reference [ignore file](https://github.com/mcarvin8/xml-disassembler#ignore-file) section from `xml-disassembler`.

## Logging

Reference [logging](https://github.com/mcarvin8/xml-disassembler#logging) section from `xml-disassembler`.

The `setLogLevel` function can be used as such:

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

## Contributing

Contributions are welcome! See [Contributing](https://github.com/mcarvin8/xml2json-disassembler/blob/main/CONTRIBUTING.md).

## Template

This project was created from a template provided by [Allan Oricil](https://github.com/AllanOricil).

His original [license](https://github.com/AllanOricil/js-template/blob/main/LICENSE) remains in this project.
