"use strict";
import { assert } from "chai";
import { getLogger } from "log4js";
import { Virtualbox } from "../../dist/virtualbox";

const virtualbox = new Virtualbox();
const MACHINE_NAME = "keyboardputscancodes";

describe("Virtualbox#keyboardPutScanCodes", () => {
  before(async () => {
    const isRunning = await virtualbox.isRunning(MACHINE_NAME);
    assert.ok(isRunning, "Machine is not running!");
  });
});
