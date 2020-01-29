"use strict";
import { Virtualbox } from "../../dist/virtualbox";
import { assert } from "chai";
import { getLogger } from "log4js";

const logger = getLogger("ACPI Sleep Button integration test");
const MACHINE_NAME = "acpisleepbutton";
const virtualbox = new Virtualbox();

describe("Virtualbox#acpisleepbutton", () => {
  before(async () => {
    const result =
      (await virtualbox.isRunning(MACHINE_NAME)) &&
      (await virtualbox.machineExists(MACHINE_NAME));
    assert.ok(result, "Machine is not running!");
  });

  it("should be successful", async () => {
    const result = await virtualbox.acpisleepbutton(MACHINE_NAME);
    logger.info(JSON.stringify(result, null, 4));
    assert.equal(result.success, true);
  });
});
