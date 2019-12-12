"use strict";
import assert from "assert";
import * as fs from "fs";
import { getLogger } from "log4js";
import * as path from "path";
import { Virtualbox } from "../../dist/virtualbox";

const logger = getLogger("VM Export Integration Test");
const MACHINE_NAME = "test-machine-1";
const virtualbox = new Virtualbox();
const IMAGE_NAME = "test.ovf";
const FILE_PATH = path.join(process.cwd(), "testexport");

before(async () => {
  const result = await virtualbox.isRunning(MACHINE_NAME);
  if (!fs.existsSync(FILE_PATH)) {
    fs.mkdirSync(FILE_PATH);
  }
  assert.ok(
    !result,
    "Machine is not running! Please run the vagrantfile in the root of the project!"
  );
});

describe("Virtualbox#vmExport", async () => {
  it("should be successful", async () => {
    this.timeout(30000);
    const result = await virtualbox.vmExport(
      MACHINE_NAME,
      `${FILE_PATH}/${IMAGE_NAME}`
    );
    logger.info(JSON.stringify(result, null, 4));
    assert.equal(result.success, true);
  });
});

after(async () => {
  const files = fs.readdirSync(FILE_PATH);
  files.forEach((x: string) => {
    fs.unlinkSync(`${FILE_PATH}/${x}`);
  });
  fs.rmdirSync(FILE_PATH);
});
