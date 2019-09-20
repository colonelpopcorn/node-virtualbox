// tslint:disable: only-arrow-functions
"use strict";
import assert from "assert";
import { getLogger } from "log4js";
import Virtualbox from "../../dist/virtualbox";
const logger = getLogger("VM Exec Integration Test");
const MACHINE_NAME = "test-machine-1";
const virtualbox = new Virtualbox();

before(async function() {
  const result = await virtualbox.isRunning(MACHINE_NAME);
  assert.ok((result), "Machine is not running! Please run the vagrantfile in the root of the project!");
});

describe("Virtualbox#vmExec", function() {
  it("should be successful", async function() {
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
    const os = await virtualbox.getOSType(vm);
    const path = os ===  "windows" ? "ping.exe" : "ping";
    return { vm, user, passwd: user /* also user*/, path, params: ["https://google.com"] };
  } catch (ex) {
    logger.error("Failed to get options", ex);
  }
}
