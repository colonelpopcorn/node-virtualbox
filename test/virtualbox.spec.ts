import { Virtualbox } from '../lib/virtualbox';
import { testData } from './testdata';
import { stub } from 'sinon';

const VM_NAME = "testvm";

describe("Virtualbox", () => {
  describe("#acpipowerbutton", () => {
    it("should turn off a VM", (done) => {
      const virtualbox = new Virtualbox();
      virtualbox.executor = stub().resolves(testData.ACPI_POWER_BUTTON.stdOut);     
      virtualbox.acpipowerbutton(VM_NAME).then(() => { done(); });
    });
  });
  describe("#acpisleepbutton", () => {
    it("should sleep a VM", (done) => {
      const virtualbox = new Virtualbox();
      virtualbox.executor = stub().resolves(testData.ACPI_SLEEP_BUTTON_OUTPUT.stdOut);     
      virtualbox.acpipowerbutton(VM_NAME).then(() => { done(); });
    })
  })
});
