export const testData = {
  ACPI_POWER_BUTTON: {
    INPUT: `vboxmanage controlvm testvm acpipowerbutton`,
    OUTPUT: {
      error: "",
      stdErr: null,
      stdOut: ``,
    },
  },
  ACPI_SLEEP_BUTTON: {
    INPUT: `vboxmanage controlvm testvm acpisleepbutton`,
    OUTPUT: {
      error: "",
      stdErr: null,
      stdOut: ``,
    },
  },
  EXEC_OUTPUT: {
    stdErr: null,
    stdOut: ``,
  },
  GET_OS_TYPE: {
    INPUT: `vboxmanage showvminfo -machinereadable testvm`,
    OUTPUT: {
      error: "",
      stdErr: null,
      stdOut: ``,
    },
  },
  GET_VERSION: {
    INPUT: `vboxmanage --version`,
    OUTPUT: {
      error: "",
      stdErr: null,
      stdOut: ``,
    },
  },
  POWER_OFF_OUTPUT: {
    stdErr: null,
    stdOut: `0%...10%...20%...30%...40%...50%...60%...70%...80%...90%...100%`,
  },
};
