import { assert } from "chai";
import { stub } from "sinon";
import { Virtualbox } from "../lib/virtualbox";
import { testData } from "./testdata";

const VM_NAME = "testvm";

describe("Virtualbox", () => {
  const getBasicStub = () => {
    return stub()
      .withArgs(testData.GET_VERSION.INPUT)
      .resolves(testData.GET_VERSION.OUTPUT)
      .withArgs(testData.GET_OS_TYPE.INPUT)
      .resolves(testData.GET_OS_TYPE.OUTPUT);
  };
  it("should construct an instance", () => {
    const virtualbox = new Virtualbox();

    assert.isNotNull(virtualbox.Executor);
  });

  describe("#acpipowerbutton", () => {
    const fakeACPIPowerButtonExecutor = getBasicStub()
      .withArgs(testData.ACPI_POWER_BUTTON.INPUT)
      .resolves(testData.ACPI_POWER_BUTTON.OUTPUT);
    it("should turn off a VM", () => {
      const virtualbox = new Virtualbox(fakeACPIPowerButtonExecutor);
      const result = virtualbox.acpipowerbutton(VM_NAME).then((value) => {
        virtualbox.Logging.debug(result);
      });
    });
  });
  describe("#acpisleepbutton", () => {
    const fakeACPISleepButtonExecutor = getBasicStub()
      .withArgs(testData.ACPI_SLEEP_BUTTON.INPUT)
      .resolves(testData.ACPI_SLEEP_BUTTON.OUTPUT);
    it("should sleep a VM", (done) => {
      const virtualbox = new Virtualbox(fakeACPISleepButtonExecutor);
      virtualbox.acpisleepbutton(VM_NAME).then(() => { done(); }).catch((err) => {
        // tslint:disable-next-line
        console.log("Something!");
      });
    });
  });
  describe.skip("#vmExec", () => {
    it("should ping google", (done) => {
      const virtualbox = new Virtualbox();
      virtualbox.Executor = stub().resolves(testData.EXEC_OUTPUT.stdOut);
      virtualbox.vmExec({
        params: "https://google.com",
        passwd: "password",
        path: "/vagrant",
        user: "username",
        vm: VM_NAME,
      });
    });
  });
});
