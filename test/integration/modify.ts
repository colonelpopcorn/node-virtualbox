"use strict";
import { assert } from "chai";
import { getLogger } from "log4js";
import { Virtualbox } from "../../dist/virtualbox";
const MACHINE_NAME = "test-machine-2";

describe("VirtualBox#modify", () => {
  const logger = getLogger("Modify integration test");
  const virtualbox = new Virtualbox();

  it("should modify a vm", async () => {
    const result = await virtualbox.modify(MACHINE_NAME, {
      memory: "2048"
    });
    logger.info("Modify result is", JSON.stringify(result, null, 4));
    assert.isOk(result.success, "Failed to modify vm!");
  });
});
