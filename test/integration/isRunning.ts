"use strict";
import assert from "assert";
import { getLogger } from "log4js";
import { Virtualbox } from "../../dist/virtualbox";
const logger = getLogger("ACPI Power Button integration test");
const MACHINE_NAME = "test-machine-1";
const virtualbox = new Virtualbox();

describe("Virtualbox#acpipowerbutton", () => {
  it("should be true when a machine is running.", async () => {
    const result = await virtualbox.isRunning(MACHINE_NAME);
    assert.ok(result, "Machine is not running!");
  });
});
