"use strict";

// TODO: Move to mocha for automation
import { Virtualbox } from "../../dist/virtualbox";
import { assert } from "chai";
import { getLogger } from "log4js";

const virtualbox = new Virtualbox();
const MACHINE_NAME = "pause-resume-poweroff-reset";
const logger = getLogger("Modify integration test");

describe("Virtualbox#pause", () => {
  before(async () => {
    const result =
      (await virtualbox.isRunning(MACHINE_NAME)) &&
      (await virtualbox.machineExists(MACHINE_NAME));
    assert.ok(result, "Machine is not running!");
  });
  it("should pause a vm", async () => {
    const result = await virtualbox.pause(MACHINE_NAME);
    logger.info(result);
    assert.isOk(result);
    assert.isTrue(result.success);
    const secondRes = await virtualbox.resume(MACHINE_NAME);
    logger.info(secondRes);
    assert.isOk(secondRes);
    const thirdRes = await virtualbox.poweroff(MACHINE_NAME);
    logger.info(thirdRes);
    assert.isOk(thirdRes);
    const fourthRes = await virtualbox.start(MACHINE_NAME, false);
    logger.info(fourthRes);
    assert.isOk(fourthRes);
    const fifthRes = await virtualbox.reset(MACHINE_NAME);
    logger.info(fifthRes);
    assert.isOk(fifthRes);
  });
});
