// tslint:disable: only-arrow-functions
"use strict";
import assert from "assert";
import { getLogger } from "log4js";
import { Virtualbox } from "../../dist/virtualbox";

const logger = getLogger("Get Extra Data Integration Test");
const MACHINE_NAME = "test-machine-1";
const virtualbox = new Virtualbox();

before(async () => {
  const result = await virtualbox.isRunning(MACHINE_NAME);
  assert.ok(result, "Machine is not running!");
  // tslint:disable-next-line: max-line-length
  const setExtraData = await virtualbox.setExtraData({
    name: MACHINE_NAME,
    key: "Bob",
    value: "Loblaw, attorney at law"
  });
  assert.ok(setExtraData.success === true, "Failed to set extra data on VM!");
});

describe("Virtualbox#setExtraData && Virtualbox#getExtraData", () => {
  it("should be successful", async () => {
    const result = await virtualbox.getExtraData({
      name: MACHINE_NAME,
      key: "Bob"
    });
    logger.info(JSON.stringify(result, null, 4));
    assert.equal(result.success, true);
  });
});
