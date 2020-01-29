"use strict";
import { Virtualbox } from "../../dist/virtualbox";
import { assert } from "chai";
import { getLogger } from "log4js";

describe("Virtualbox#list", () => {
  const logger = getLogger("List integration test");
  const virtualbox = new Virtualbox();

  it("should be successful", async () => {
    const result = await virtualbox.list();
    logger.info(JSON.stringify(result, null, 4));
    assert.equal(result.success, true);
  });
});
