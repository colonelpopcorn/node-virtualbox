import { Virtualbox } from '../lib/virtualbox';
import { testData } from './testdata';
import { stub } from 'sinon';
import  { assert } from 'chai';

const VM_NAME = "testvm";

describe("Virtualbox", () => {
  const getBasicStub = () => {
    return stub()
      .withArgs(testData.GET_VERSION.INPUT)
      .resolves(testData.GET_VERSION.OUTPUT)
      .withArgs(testData.GET_OS_TYPE.INPUT)
      .resolves(testData.GET_OS_TYPE.OUTPUT);
  }
  
  it("should construct an instance", function () {
    const virtualbox = new Virtualbox();

    assert.isNotNull(virtualbox.executor);
  });

  describe("#acpipowerbutton", () => {
    const fakeACPIPowerButtonExecutor = getBasicStub()
      .withArgs(testData.ACPI_POWER_BUTTON.INPUT)
      .resolves(testData.ACPI_POWER_BUTTON.OUTPUT);
    it("should turn off a VM", () => {
      const virtualbox = new Virtualbox(fakeACPIPowerButtonExecutor);
      const result = virtualbox.acpipowerbutton(VM_NAME).then(value => {
        virtualbox.logging.debug(result);
      })
    });
  });
  describe("#acpisleepbutton", () => {
    const fakeACPISleepButtonExecutor = getBasicStub()
      .withArgs(testData.ACPI_SLEEP_BUTTON.INPUT)
      .resolves(testData.ACPI_SLEEP_BUTTON.OUTPUT);
    it("should sleep a VM", (done) => {
      const virtualbox = new Virtualbox(fakeACPISleepButtonExecutor);
      virtualbox.acpisleepbutton(VM_NAME).then(() => { done(); }).catch(err => console.log("Something!"));
    })
  })
  describe("#vmExec", () => {
    it("should ping google", (done) => {
      const virtualbox = new Virtualbox();
      virtualbox.executor = stub().resolves(testData.EXEC_OUTPUT.stdOut);
      virtualbox.vmExec({ 'vm': VM_NAME, 'user': 'username', 'passwd': 'password', 'path': '/vagrant', 'params': 'https://google.com' });
    })
  })
});
