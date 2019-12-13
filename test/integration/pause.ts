"use strict";

// TODO: Move to mocha for automation
import { assert } from "chai";
import { getLogger } from "log4js";
import { Virtualbox } from "../../dist/virtualbox";

const virtualbox = new Virtualbox();
const MACHINE_NAME = "test-machine-3";
const logger = getLogger("Modify integration test");

describe("Virtualbox#pause", () => {
  it("should pause a vm", async () => {
    const result = await virtualbox.pause(MACHINE_NAME);
    logger.info(result);
    assert.isOk(result);
    assert.isTrue(result.success);
  });
});
