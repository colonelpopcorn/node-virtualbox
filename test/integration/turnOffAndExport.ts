"use strict";
import * as fs from "fs";
import * as path from "path";
import { Virtualbox } from "../../dist/virtualbox";
import { assert } from "chai";
import { getLogger } from "log4js";
import { waitNSeconds } from "../testdata";

const logger = getLogger("VM Export Integration Test");
const MACHINE_NAME = "turnOffAndExport";
const virtualbox = new Virtualbox();
const IMAGE_NAME = "test.ovf";
const FILE_PATH = path.join(process.cwd(), "testexport");

describe("Virtualbox#turnOffAndExport", async () => {
  before(async function() {
    this.timeout(30000);
    const powerOffRes = await virtualbox.acpipowerbutton(MACHINE_NAME);
    logger.debug("Power off is: ", powerOffRes);
    // Wait five seconds for the machine to be off.
    await waitNSeconds(5);

    const result =
      (await virtualbox.isRunning(MACHINE_NAME)) &&
      (await virtualbox.machineExists(MACHINE_NAME));
    if (!fs.existsSync(FILE_PATH)) {
      fs.mkdirSync(FILE_PATH);
    }
    assert.ok(!result, "Couldn't power off the machine for export!");
  });

  it("should be successful", async function() {
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
