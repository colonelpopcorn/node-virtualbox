"use strict";
import { Virtualbox } from "../../dist/virtualbox";
import { assert } from "chai";
import { getLogger } from "log4js";

const MACHINE_NAME = "modify";

describe("VirtualBox#modify", () => {
  const logger = getLogger("Modify integration test");
  const virtualbox = new Virtualbox();

  before(async function() {
    this.timeout(30000);
    const powerOffRes = await virtualbox.acpipowerbutton(MACHINE_NAME);
    logger.debug("Power off is: ", powerOffRes);
    // Wait five seconds for the machine to be off.
    await new Promise(resolve => setTimeout(resolve, 5000));

    const result =
      (await virtualbox.isRunning(MACHINE_NAME)) &&
      (await virtualbox.machineExists(MACHINE_NAME));
    assert.ok(!result, "Couldn't power off the machine for export!");
  });

  it("should modify a vm", async () => {
    const result = await virtualbox.modify(MACHINE_NAME, {
      memory: "2048"
    });
    logger.info("Modify result is", JSON.stringify(result, null, 4));
    assert.isOk(result.success, "Failed to modify vm!");
  });

  after(async () => {
    const result = await virtualbox.modify(MACHINE_NAME, {
      memory: "128"
    });
    logger.info("Modify result is", JSON.stringify(result, null, 4));
    assert.isOk(result.success, "Failed to modify vm!");
    await virtualbox.start(MACHINE_NAME, false);
  });
});
