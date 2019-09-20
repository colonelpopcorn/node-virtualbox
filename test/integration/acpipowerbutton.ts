// tslint:disable: only-arrow-functions
"use strict";
import assert from "assert";
import { getLogger } from "log4js";
import Virtualbox from "../../dist/virtualbox";
const logger = getLogger("ACPI Power Button integration test");
const MACHINE_NAME = "test-machine-1";
const virtualbox = new Virtualbox();

before(async function() {
  const result = await virtualbox.isRunning(MACHINE_NAME);
  assert.ok((result), "Machine is not running!");
});

describe("Virtualbox#acpipowerbutton", function() {
  it("should be successful", async function() {
    const result = await virtualbox.acpipowerbutton(MACHINE_NAME);
    logger.info(JSON.stringify(result, null, 4));
    assert.equal(result.success, true);
  });
});
