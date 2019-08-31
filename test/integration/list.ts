"use strict";
import assert from "assert";
import { getLogger } from "log4js";
import Virtualbox from "../../dist/virtualbox";

describe("Virtualbox#list", () => {
  const logger = getLogger("List integration test");
  it("should be successful", async () => {
    const virtualbox = new Virtualbox();
    const result = await virtualbox.list();
    logger.info(JSON.stringify(result, null, 4));
    assert.equal(result.success, true);
  });
});
