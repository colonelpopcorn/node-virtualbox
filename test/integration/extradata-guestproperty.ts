"use strict";
import { Virtualbox } from "../../dist/virtualbox";
import { assert } from "chai";
import { getLogger } from "log4js";

const logger = getLogger("Get/Set Extra Data Integration Test");
const MACHINE_NAME = "extradata-guestproperty";
const virtualbox = new Virtualbox();

describe(`
  Virtualbox#setExtraData && Virtualbox#getExtraData &&
  Virtualbox#setGuestProperty && Virtualbox#getGuestProperty
  `, () => {
  before(async () => {
    const result =
      (await virtualbox.isRunning(MACHINE_NAME)) &&
      (await virtualbox.machineExists(MACHINE_NAME));
    assert.ok(result, "Machine is not running!");
  });

  it("should be successful", async () => {
    const setExtraData = await virtualbox.setExtraData({
      name: MACHINE_NAME,
      key: "Bob",
      value: "Loblaw, attorney at law"
    });
    assert.ok(setExtraData.success === true, "Failed to set extra data on VM!");
    const getExtraDataRes = await virtualbox.getExtraData({
      name: MACHINE_NAME,
      key: "Bob"
    });
    logger.info(JSON.stringify(getExtraDataRes, null, 4));
    assert.equal(getExtraDataRes.success, true);
    const opts = {
      vmName: MACHINE_NAME,
      key: "Bob",
      value: "Loblaw, attorney at law"
    };
    const setGuestProperty = await virtualbox.setGuestProperty(opts);
    assert.ok(
      setGuestProperty.success === true,
      "Failed to set extra data on VM!"
    );
    const guestPropertyRes = await virtualbox.getGuestProperty({
      vmName: MACHINE_NAME,
      key: "Bob"
    });
    logger.info(JSON.stringify(getExtraDataRes, null, 4));
    assert.equal(guestPropertyRes.success, true);
    assert.equal(guestPropertyRes.value, "Loblaw, attorney at law");
  });
});
