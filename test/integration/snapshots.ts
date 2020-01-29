"use strict";
import { Virtualbox } from "../../dist/virtualbox";
import { assert } from "chai";
import { getLogger } from "log4js";
import { waitNSeconds } from "../testdata";
// TODO: Move to mocha for automation
const MACHINE_NAME = "snapshots";
const virtualbox = new Virtualbox();
const logger = getLogger("Snapshots Integration Test");

describe("VirtualBox#snapshotTake", () => {
  let machineUuid = "";
  it("should take a snapshot", async () => {
    const result = await virtualbox.snapshotTake(
      MACHINE_NAME,
      "test-snapshot",
      "This is a test snapshot.",
      true
    );
    logger.info(result);
    assert.isTrue(result.success);
    waitNSeconds(3);
    const snaps = await virtualbox.snapshotList(MACHINE_NAME);
    logger.info(snaps);
    machineUuid = snaps.currentSnapshot;
    assert.isArray(snaps.snapshotList);
    assert.propertyVal(snaps.snapshotList[0], "SnapshotName", "test-snapshot");
  });

  it("should restore a snapshot", async () => {
    await virtualbox.poweroff(MACHINE_NAME);
    const restore = await virtualbox.snapshotRestore(MACHINE_NAME, machineUuid);
    logger.info(restore);
    assert.isTrue(restore.success);
  });

  it("Should delete a snapshot", async () => {
    const result = await virtualbox.snapshotDelete(MACHINE_NAME, machineUuid);
    logger.info(result);
    assert.isTrue(result.success);
  });
});
