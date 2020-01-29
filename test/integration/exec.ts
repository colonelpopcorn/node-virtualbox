"use strict";
import { Virtualbox } from "../../dist/virtualbox";
import { assert } from "chai";
import { getLogger } from "log4js";

const logger = getLogger("VM Exec Integration Test");
const MACHINE_NAME = "exec";
const virtualbox = new Virtualbox();

describe("Virtualbox#vmExec", () => {
  before(async () => {
    const result = await virtualbox.isRunning(MACHINE_NAME);
    assert.ok(
      result,
      "Machine is not running! Please run the vagrantfile in the root of the project!"
    );
  });

  it("should be successful", async () => {
    const execOpts = await getOpts();
    const result = await virtualbox.vmExec(execOpts);
    logger.info(JSON.stringify(result, null, 4));
    assert.equal(result.success, true);
  });
});

async function getOpts(): Promise<any> {
  try {
    const vm = MACHINE_NAME;
    const user = "vagrant";
    const path = "apk";
    return {
      vm,
      user,
      passwd: user /* Also user */,
      path,
      params: ["--help"]
    };
  } catch (ex) {
    logger.error("Failed to get options", ex);
  }
}
