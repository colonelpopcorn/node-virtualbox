"use strict";
import { Virtualbox } from "../../dist/virtualbox";
import { assert } from "chai";
import { getLogger } from "log4js";

const virtualbox = new Virtualbox();
const MACHINE_NAME = "keyboardputscancodes";

describe("Virtualbox#keyboardPutScanCodes", () => {
  before(async () => {
    const isRunning = await virtualbox.isRunning(MACHINE_NAME);
    assert.ok(isRunning, "Machine is not running!");
  });
});
