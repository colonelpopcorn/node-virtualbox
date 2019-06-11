export const testData = {
  ACPI_POWER_BUTTON: {
    INPUT: `vboxmanage controlvm testvm acpipowerbutton`,
    OUTPUT: {
      error: "",
      stdOut: ``,
      stdErr: null,
    },
  },
  GET_VERSION: {
    INPUT: `vboxmanage --version`,
    OUTPUT: {
      error: "",
      stdOut: ``,
      stdErr: null,
    },
  },
  GET_OS_TYPE: {
    INPUT: `vboxmanage showvminfo -machinereadable testvm`,
    OUTPUT: {
      error: "",
      stdOut: ``,
      stdErr: null,
    },
  },
  ACPI_SLEEP_BUTTON: {
    INPUT: `vboxmanage controlvm testvm acpisleepbutton`,
    OUTPUT: {
      error: "",
      stdOut: ``,
      stdErr: null,
    },
  },
  EXEC_OUTPUT: {
    stdOut: ``,
    stdErr: null,
  },
  POWER_OFF_OUTPUT: {
    stdOut: `0%...10%...20%...30%...40%...50%...60%...70%...80%...90%...100%`,
    stdErr: null,
  },
};
