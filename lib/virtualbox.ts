// TODO: Add github pages publish to CI after typedoc works
// TODO: Add automatic testing of regex patterns.
import { exec, ExecException } from "child_process";
import { configure, getLogger, Logger } from "log4js";

/**
 * IChildProcessResult
 * An interface to capture execution results from the child_process node library.
 */
declare interface IChildProcessResult { error?: ExecException; stdout: string; stderr?: string; }

declare interface IVboxApiResponse { responseMessage: string; success: boolean; [key: string]: any; }
/**
 * Virtualbox
 * A node wrapper around the vboxmanage binary.
 */
export default class Virtualbox {
  get Executor(): (command: string) => Promise<IChildProcessResult> {
    return this.executor;
  }
  set Executor(executor: (command: string) => Promise<IChildProcessResult>) {
    this.executor = executor;
  }

  private codes = {
    A: [30],
    ALT: [56],
    B: [48],
    BACKQUOTE: [41],
    BACKSLASH: [43],
    BACKSPACE: [14],
    C: [46],
    CAPS_LOCK: [58],
    COMMA: [51],
    CTRL: [29],
    D: [32],
    DELETE: [224, 83],
    DOWN: [224, 80],
    E: [18],
    END: [224, 79],
    ENTER: [28],
    EQUAL: [13],
    ESCAPE: [1],
    F: [33],
    F1: [59],
    F10: [68],
    F11: [87],
    F12: [88],
    F2: [60],
    F3: [61],
    F4: [62],
    F5: [63],
    F6: [64],
    F7: [65],
    F8: [66],
    F9: [67],
    G: [34],
    H: [35],
    HOME: [224, 71],
    I: [23],
    INSERT: [224, 82],
    J: [36],
    K: [37],
    L: [38],
    LEFT: [224, 75],
    LEFTBRACKET: [26],
    M: [50],
    MENU: [224, 93],
    MINUS: [12],
    N: [49],
    NUMBER_0: [11],
    NUMBER_1: [2],
    NUMBER_2: [3],
    NUMBER_3: [4],
    NUMBER_4: [5],
    NUMBER_5: [6],
    NUMBER_6: [7],
    NUMBER_7: [8],
    NUMBER_8: [9],
    NUMBER_9: [10],
    NUMBER_DIVIDE: [224, 53],
    NUMPAD_0: [82],
    NUMPAD_1: [79],
    NUMPAD_2: [80],
    NUMPAD_3: [81],
    NUMPAD_4: [75],
    NUMPAD_5: [76],
    NUMPAD_6: [77],
    NUMPAD_7: [71],
    NUMPAD_8: [72],
    NUMPAD_9: [73],
    NUMPAD_ADD: [78],
    NUMPAD_DECIMAL: [83],
    NUMPAD_SUBTRACT: [74],
    NUM_LOCK: [69],
    O: [24],
    P: [25],
    PAGE_DOWN: [224, 81],
    PAGE_UP: [224, 73],
    PAUSE: [225, 29, 69, 225, 157, 197],
    PERIOD: [52],
    PRT_SC: [55],
    Q: [16],
    QUOTE: [40],
    R: [19],
    RIGHT: [224, 77],
    RIGHTBRACKET: [27],
    R_ALT: [224, 56],
    R_CTRL: [224, 29],
    R_SHIFT: [54],
    R_WINDOW: [224, 92],
    S: [31],
    SCROLL_LOCK: [70],
    SEMICOLON: [39],
    SHIFT: [42],
    SLASH: [53],
    SPACE: [57],
    T: [20],
    TAB: [15],
    U: [22],
    UP: [224, 72],
    V: [47],
    W: [17],
    WINDOW: [224, 91],
    X: [45],
    Y: [21],
    Z: [44],
  };
  private REGEX = {
    CARRIAGE_RETURN_LINE_FEED: /\r?\n/g,
    DOUBLE_BACKSLASH: /\\/g,
    ESCAPED_QUOTE: /\"/,
    LINUX: /^linux/,
    MAC_OS: /^darwin/,
    // "centos6" {64ec13bb-5889-4352-aee9-0f1c2a17923d}
    UUID_PARSE: /UUID\: ([a-f0-9\-]+)$/,
    VBOX_E_INVALID_OBJECT_STATE: /VBOX_E_INVALID_OBJECT_STATE/,
    WINDOWS: /^win/,
  };

  private osType: string;
  private hostPlatform: string;
  private vboxVersion: string;
  private vboxManageBinary: string;
  private logging: Logger;
  private executor: (command: string) => Promise<IChildProcessResult>;
  private knownOSTypes = {
    LINUX: "linux",
    MAC: "mac",
    WINDOWS: "windows",
  };

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  constructor(executor?: (command: string) => Promise<IChildProcessResult>) {
    configure({
      appenders: {
        out: {
          layout: {
            pattern: "%[[%d{yyyy-MM-dd hh:mm:ss.SSS}] [%p] %c - %]%m",
            type: "pattern",
          },
          type: "stdout",
        },
      },
      categories: { default: { appenders: ["out"], level: "info" } },
    });

    this.logging = getLogger("VirtualBox");

    if (executor === undefined) {
      this.Executor = (command: string): Promise<IChildProcessResult> => {
        return new Promise((resolve, reject) => {
          exec(command, (error, stdout, stderr) => {
            if (error) {
              reject(error);
            } else {
              resolve({stdout, stderr});
            }
          });
        });
      };
    } else {
      this.Executor = executor;
    }
    this.setVboxManageBinary();
    this.setVersion();
    this.hostPlatform = process.platform;
  }

  /**
   * Sets the binary location
   */
  // TODO: Write test
  // TODO: Add catch block
  public setVboxManageBinary(): void {
    let vBoxManageBinary;
    // Host operating system
    if (this.REGEX.WINDOWS.test(this.hostPlatform)) {
      // Path may not contain VBoxManage.exe but it provides this environment variable
      const vBoxInstallPath =
        process.env.VBOX_INSTALL_PATH || process.env.VBOX_MSI_INSTALL_PATH;
      vBoxManageBinary = `"${vBoxInstallPath}\\VBoxManage.exe" `;
    } else if (
      this.REGEX.MAC_OS.test(this.hostPlatform) ||
      this.REGEX.LINUX.test(this.hostPlatform)
    ) {
      // Mac OS X and most Linux use the same binary name, in the path
      vBoxManageBinary = "vboxmanage ";
    } else {
      // Otherwise (e.g., SunOS) hope it's in the path
      vBoxManageBinary = "vboxmanage ";
    }
    this.vboxManageBinary = vBoxManageBinary;
  }

  /**
   * Pause a vm.
   * @param vmname VM name or uuid
   */
  // TODO: Write test
  // TODO: Add catch block
  public async pause(vmname): Promise<IChildProcessResult> {
    this.logging.info('Pausing VM "%s"', vmname);
    return await this.vboxmanage('controlvm "' + vmname + '" pause');
  }


  /**
   * Check to see if a vm exists by name or uuid
   * @param vmName VM name or uuid
   */
  public async machineExists(vmName: string): Promise<boolean> {
    try {
      const fullList = await this.list();
      const doesExist = fullList.list.some((x) => x.name === vmName || x.guid === vmName);
      return doesExist;
    } catch (err) {
      return false;
    }
  }

  /**
   * Get a list of VMs on the current system.
   */
  // TODO: Write test
  // TODO: Add catch block
  public async list(): Promise<IVboxApiResponse> {
    this.logging.info("Listing VMs");
    try {
      const result = await this.vboxmanage('list "runningvms"');
      const secondResult = await this.vboxmanage('list "vms"');
      const runningVms = this.parseListData(result.stdout);
      const all = this.parseListData(secondResult.stdout).map((x) => {
        const runningVm = runningVms.find((y) => y.guid === x.guid);
        x.running = !!(runningVm);
        return x;
      });
      return {
        list: all,
        responseMessage: "Successfully grabbed vms.",
        success: true,
      };
    } catch (error) {
      return {
        error,
        responseMessage: "Error trying to list vms.",
        success: false,
      };
    }
  }

  public getListFromStdOut(stdout: string) {
    this.logging.debug(stdout);
    return stdout.split("\n")
      .map((x) => x.split(" ")
        .map((y) => ({ name: y[0], guid: y[1] })),
      );
  }

  /**
   * Reset a vm
   * @param vmname VM name or uuid
   */
  // TODO: Write test
  // TODO: Add catch block
  public async reset(vmname): Promise<IChildProcessResult> {
    this.logging.info('Resetting VM "%s"', vmname);
    return await this.vboxmanage('controlvm "' + vmname + '" reset');
  }

  /**
   * Resume a paused VM
   * @param vmname VM name or uuid
   */
  // TODO: Write test
  // TODO: Add catch block
  public async resume(vmname): Promise<IChildProcessResult> {
    this.logging.info('Resuming VM "%s"', vmname);
    return await this.vboxmanage('controlvm "' + vmname + '" resume');
  }

  /**
   * Start a stopped VM
   * @param vmname VM name or uuid
   * @param useGui Whether or not to start machine with a GUI
   */
  // TODO: Write test
  // TODO: Add catch block
  public async start(vmname: string, useGui: boolean): Promise<IChildProcessResult> {
    let startOpts = " --type ";
    if (typeof useGui === "function") {
      useGui = false;
    }
    startOpts += useGui ? "gui" : "headless";

    this.logging.info('Starting VM "%s" with options:', vmname, startOpts);

    const result = await this.vboxmanage(
      '-nologo startvm "' + vmname + '"' + startOpts,
    );
    if (
      result.error &&
      !(this.REGEX.VBOX_E_INVALID_OBJECT_STATE.test(result.error.message))
    ) {
      throw new Error(`${result.error}`);
    } else {
      return result;
    }
  }

  /**
   * Suspend a VM
   * @param vmname VM name or uuid
   */
  // TODO: Write test
  // TODO: Add catch block
  public async stop(vmname): Promise<IChildProcessResult> {
    this.logging.info('Stopping VM "%s"', vmname);
    return await this.vboxmanage('controlvm "' + vmname + '" savestate');
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async savestate(vmname): Promise<IChildProcessResult> {
    this.logging.info('Saving State (alias to stop) VM "%s"', vmname);
    return await this.stop(vmname);
  }

  /**
   * Export a VM to a file.
   * @param vmname VM name or uuid
   * @param output Full path for export filename. Extension should be one of these:
   * - ovf
   * - ova
   * - tar.gz
   */
  // TODO: Write test
  // TODO: Add catch block
  public async vmExport(vmname: string, output: string): Promise<IChildProcessResult> {
    this.logging.info('Exporting VM "%s"', vmname);
    return await this.vboxmanage(
      'export "' + vmname + '" --output "' + output + '"',
    );
  }

  /**
   * Hard shutdown the VM
   * @param vmname VM name or uuid
   */
  // TODO: Write test
  // TODO: Add catch block
  public async poweroff(vmname: string): Promise<IChildProcessResult> {
    this.logging.info('Powering off VM "%s"', vmname);
    return await this.vboxmanage('controlvm "' + vmname + '" poweroff');
  }

  /**
   * Send a "power button pressed" signal to the VM
   * @param vmname VM name or uuid
   */
  // TODO: Write test
  // TODO: Add catch block
  public async acpipowerbutton(vmname: string): Promise<IVboxApiResponse> {
    this.logging.info('ACPI power button VM "%s"', vmname);
    const result = await this.vboxmanage('controlvm "' + vmname + '" acpipowerbutton');
    this.logging.debug(result);
    if (result.stderr === undefined || result.stderr === "") {
      return {
        responseMessage: `Successfully sent power cycle signal to ${vmname}`,
        success: true,
      };
    } else {
      return {
        error: result.stderr,
        responseMessage: `Something went wrong while sending power cycle signal to ${vmname}`,
        success: false,
      };
    }
  }

  /**
   * Send a "sleep button pressed" signal to the VM
   * @param vmname VM name or uuid
   */
  // TODO: Write test
  // TODO: Add catch block
  public async acpisleepbutton(vmname: string): Promise<IChildProcessResult> {
    this.logging.info('ACPI sleep button VM "%s"', vmname);
    return await this.vboxmanage(`controlvm ${vmname} acpisleepbutton`);
  }

  /**
   * Modify a VM
   * @param vname VM name or uuid
   * @param properties Virtualbox properties object
   */
  // TODO: Write test
  // TODO: Add catch block
  public async modify(vname: string, properties): Promise<IChildProcessResult> {
    this.logging.info("Modifying VM %s", vname);
    const args = [vname];

    for (const property in properties) {
      if (properties.hasOwnProperty(property)) {
        const value = properties[property];
        args.push("--" + property);

        if (Array.isArray(value)) {
          Array.prototype.push.apply(args, value);
        } else {
          args.push(value.toString());
        }
      }
    }

    const cmd =
      "modifyvm " +
      args
        .map((arg) => {
          return '"' + arg + '"';
        })
        .join(" ");

    return await this.vboxmanage(cmd);
  }

  /**
   * List snapshots for a VM
   * @param vmname VM name or uuid
   */
  // TODO: Write test
  // TODO: Add catch block
  public async snapshotList(vmname: string): Promise<{ snapshotList: any[]; currentSnapshot: any }> {
    this.logging.info('Listing snapshots for VM "%s"', vmname);
    const result = await this.vboxmanage(
      'snapshot "' + vmname + '" list --machinereadable',
    );

    this.logging.debug(result);

    if (result[1] !== "") {
      throw new Error(result[1]);
    }

    const snapshots = new Array<any>();
    const lines = (result[0] || "").split(require("os").EOL);
    const newObj: any = {};

    lines.forEach((line) => {
      line
        .trim()
        .split("=")
        .forEach((l, k, v) => {
          const key = `${v[0]}`;
          if ((k + 1) % 2 === 0) {
            newObj[key] = v[1].replace(/\"/g, "");
          }
        });
    });
    return { snapshotList: [newObj], currentSnapshot: newObj.CurrentSnapshotUUID };
  }

  /**
   * Take a snapshot for a VM
   * @param vmname VM name or uuid
   * @param name Snapshot name
   * @param description Description object
   * @param live Should be a live snapshot
   */
  // TODO: Write test
  // TODO: Add catch block
  public async snapshotTake(
    vmname: string,
    name: string,
    description?,
    live = false,
  ): Promise< string > {
    this.logging.info('Taking snapshot for VM "%s"', vmname);

    let cmd =
      "snapshot " + JSON.stringify(vmname) + " take " + JSON.stringify(name);

    if (description) {
      cmd += " --description " + JSON.stringify(description);
    }

    if (live === true) {
      cmd += " --live";
    }

    const result = await this.vboxmanage(cmd);
    let uuid;
    if (result.error) {
      throw new Error(`${result.error}`);
    }
    uuid = result.stdout.trim().replace(this.REGEX.UUID_PARSE, (l, u) => {
      return u;
    });
    return uuid;
  }

  /**
   * Delete a snapshot for a VM
   * @param vmname VM name or uuid
   * @param uuid Snapshot uuid to delete
   */
  // TODO: Write test
  // TODO: Add catch block
  public async snapshotDelete(vmname: string, uuid): Promise<IChildProcessResult> {
    this.logging.info('Deleting snapshot "%s" for VM "%s"', uuid, vmname);
    const cmd =
      "snapshot " + JSON.stringify(vmname) + " delete " + JSON.stringify(uuid);
    return await this.vboxmanage(cmd);
  }

  /**
   * Restore a VM from a snapshot
   * @param vmname VM name or uuid
   * @param uuid Snapshot uuid to restore to
   */
  // TODO: Write test
  // TODO: Add catch block
  public async snapshotRestore(vmname: string, uuid): Promise<IChildProcessResult> {
    this.logging.info('Restoring snapshot "%s" for VM "%s"', uuid, vmname);
    const cmd =
      "snapshot " + JSON.stringify(vmname) + " restore " + JSON.stringify(uuid);
    return await this.vboxmanage(cmd);
  }

  /**
   * Check to see if a particular machine isRunning
   * @param vmname VM name or uuid
   */
  // TODO: Write test
  // TODO: Add catch block
  public async isRunning(vmname): Promise<boolean> {
    const cmd = "list runningvms";
    const result = await this.vboxmanage(cmd);
    this.logging.info('Checking virtual machine "%s" is running or not', vmname);
    if (result.stdout.includes(vmname)) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Send keyboard character codes to a VM
   * @param vmname VM name or uuid
   * @param codes Codes to send.
   */
  // TODO: Write test
  // TODO: Add catch block
  public async keyboardputscancode(vmname: string, codes): Promise<IChildProcessResult> {
    const codeStr = codes
      .map((code) => {
        let s = code.toString(16);

        if (s.length === 1) {
          s = "0" + s;
        }
        return s;
      })
      .join(" ");
    this.logging.info('Sending VM "%s" keyboard scan codes "%s"', vmname, codeStr);
    return await this.vboxmanage(
      'controlvm "' + vmname + '" keyboardputscancode ' + codeStr,
    );
  }

  /**
   * Execute a program inside a VM
   * @param options Execution config
   */
  // TODO: Write test
  // TODO: Add catch block
  public async vmExec(options): Promise<IChildProcessResult> {
    const vm = options.vm || options.name || options.vmname || options.title;
    const username = options.user || options.username || "Guest";
    const password = options.pass || options.passwd || options.password;
    let path = options.path ||
        options.cmd ||
        options.command ||
        options.exec ||
        options.execute ||
        options.run;
    let cmd;
    let params = options.params || options.parameters || options.args;

    if (Array.isArray(params)) {
      params = params.join(" ");
    }

    if (params === undefined) {
      params = "";
    }

    const osType = await this.getOSType(vm);

    cmd = 'guestcontrol "' + vm + '"';
    let runcmd = " execute  --image ";

    if (this.vboxVersion.includes("5.")) {
      runcmd = " run ";
    }

    switch (osType) {
      case this.knownOSTypes.WINDOWS:
        path = path.replace(this.REGEX.DOUBLE_BACKSLASH, "\\\\");
        cmd +=
          runcmd +
          ' "cmd.exe" --username ' +
          username +
          (password ? " --password " + password : "") +
          ' -- "/c" "' +
          path +
          '" "' +
          params +
          '"';
        break;
      case this.knownOSTypes.MAC:
        cmd +=
          runcmd +
          ' "/usr/bin/open -a" --username ' +
          username +
          (password ? " --password " + password : "") +
          ' -- "/c" "' +
          path +
          '" "' +
          params +
          '"';
        break;
      case this.knownOSTypes.LINUX:
        cmd +=
          runcmd +
          ' "/bin/sh" --username ' +
          username +
          (password ? " --password " + password : "") +
          ' -- "/c" "' +
          path +
          '" "' +
          params +
          '"';
        break;
      default:
        break;
    }

    this.logging.info(
      'Executing command "vboxmanage %s" on VM "%s" detected OS type "%s"',
      cmd,
      vm,
      osType,
    );

    return await this.vboxmanage(cmd);
  }

  /**
   * Kill a process inside of a VM
   * @param options Process config
   */
  // TODO: Write test
  // TODO: Add catch block
  public async vmKill(options): Promise<IChildProcessResult> {
    let result;
    options = options || {};
    const vm = options.vm || options.name || options.vmname || options.title;
    const path =
        options.path ||
        options.cmd ||
        options.command ||
        options.exec ||
        options.execute ||
        options.run;
    const imageName = options.image_name || path;
    const cmd = 'guestcontrol "' + vm + '" process kill';

    await this.getOSType(vm);
    switch (this.osType) {
      case this.knownOSTypes.WINDOWS:
        result = await this.vmExec({
          params: imageName,
          password: options.password,
          path: "C:\\Windows\\System32\\taskkill.exe /im ",
          user: options.user,
          vm,
        });
      case this.knownOSTypes.MAC:
      case this.knownOSTypes.LINUX:
        result = await this.vmExec({
          params: imageName,
          password: options.password,
          path: "sudo killall ",
          user: options.user,
          vm,
        });
    }
    return result;
  }

  /**
   * Get a guest property from a VM
   * @param options Guest configuration
   */
  // TODO: Write test
  // TODO: Add catch block
  public async getGuestProperty(options): Promise< any > {
    const vm = options.vm || options.name || options.vmname || options.title;
    const key = options.key;
    const value = options.defaultValue || options.value;
    await this.getOSType(vm);
    const cmd = 'guestproperty get "' + vm + '" ' + key;
    const result = await this.vboxmanage(cmd);
    if (result.error) {
      throw result.error;
    }
    let retValue: (string | undefined) = result.stdout.substr(result.stdout.indexOf(":") + 1).trim();
    if (retValue === "No value set!") {
      retValue = undefined;
    }
    return retValue;
  }

  /**
   * Get extra data from a VM
   * @param options Guest configuration
   */
  // TODO: Write test
  // TODO: Add catch block
  public async getExtraData(options): Promise< any > {
    const vm = options.vm || options.name || options.vmname || options.title;
    const key = options.key;
    let value = options.defaultValue || options.value;

    const cmd = 'getextradata "' + vm + '" "' + key + '"';
    const result = await this.vboxmanage(cmd);
    if (result[1]) {
      throw result[1];
    }
    value = result[0].substr(result[0].indexOf(":") + 1).trim();
    if (value === "No value set!") {
      value = undefined;
    }
    return value;
  }

  /**
   * Set extra data for a VM
   * @param options Guest configuration
   */
  // TODO: Write test
  // TODO: Add catch block
  public async setExtraData(options): Promise<IChildProcessResult> {
    const vm = options.vm || options.name || options.vmname || options.title;
    const key = options.key;
    const value = options.defaultValue || options.value;

    const cmd = 'setextradata "' + vm + '" "' + key + '" "' + value + '"';
    return await this.vboxmanage(cmd);
  }

  public getBreakCode(key) {
    const makeCode = this.codes[key];
    if (makeCode === undefined) {
      throw new Error("Undefined key: " + key);
    }

    if (key === "PAUSE") {
      return [];
    }

    if (makeCode[0] === 0xE0) {
      return [ 0xE0, makeCode[1] + 0x80 ];
    } else {
      return [ makeCode[0] + 0x80 ];
    }
  }

  /**
   * Sets the version of the vboxmanage binary
   */
  // TODO: Write test
  // TODO: Add catch block?
  private async setVersion(): Promise<void> {
    const result = await this.Executor(this.vboxManageBinary + " --version");
    // e.g., "4.3.38r106717" or "5.0.20r106931"
    this.vboxVersion = result.stdout;
    this.logging.info("Virtualbox version detected as %s", this.vboxVersion);
  }

  /**
   * Execute a command on the host machine
   * @param cmd Command string to execute
   */
  // TODO: Write test
  // TODO: Add catch block?
  private async command(cmd: string): Promise<IChildProcessResult> {
    const result: IChildProcessResult = await this.Executor(cmd);
    if (
      result.error &&
      cmd.indexOf("pause") !== -1 &&
      cmd.indexOf("savestate") !== -1
    ) {
      const errMessage = `${result.error}`;
      throw new Error(errMessage);
    }
    return result;
  }

  /**
   * Run vboxcontrol with arugments
   * @param cmd Argument to vboxcontrol
   */
   // TODO: Add catch block?
  private async vboxcontrol(cmd): Promise<IChildProcessResult> {
    return await this.command("VBoxControl " + cmd);
  }

  /**
   * Run vboxmanage with argumetns
   * @param cmd Arguments to vboxmanage
   */
  // TODO: Write test
  // TODO: Add catch block?
  private async vboxmanage(cmd): Promise<IChildProcessResult> {
    const result = await this.command(this.vboxManageBinary + cmd);
    return result;
  }

  private parseListData(rawData): any {
    const raw = rawData.split(this.REGEX.CARRIAGE_RETURN_LINE_FEED);
    const data: any[] = [];
    if (raw.length > 0) {
      for (const item of raw) {
        if (item === "") {
          continue;
        }

        const arrMatches = item.split(" ");
        // {'64ec13bb-5889-4352-aee9-0f1c2a17923d': 'centos6'}
        if (arrMatches && arrMatches.length === 2) {
          const name = arrMatches[0].toString().replace(/\"/gi, "");
          const guid = arrMatches[1].toString();
          data.push({
            guid,
            name,
          });
        }
      }
    }
    return data;
  }

  /**
   * Get OS type
   * @param vmName VM name or uuid
   */
  // TODO: Write test
  // TODO: Add catch block?
  private async getOSType(vmName): Promise< string > {
    if (this.osType) {
      return this.osType;
    }

    let result;
    try {
      result = await this.Executor(
        `${this.vboxManageBinary} showvminfo -machinereadable ${vmName}`,
      );
    } catch (e) {
      this.logging.info("Could not showvminfo for %s", vmName);
    }

    if (result || result.error) {
      throw result.error;
    }

    // The ostype is matched against the ID attribute of 'vboxmanage list ostypes'
    if (result.stdout.indexOf('ostype="Windows') !== -1) {
      this.osType = this.knownOSTypes.WINDOWS;
    } else if (result.stdout.indexOf('ostype="MacOS') !== -1) {
      this.osType = this.knownOSTypes.MAC;
    } else {
      this.osType = this.knownOSTypes.LINUX;
    }
    this.logging.debug("Detected guest OS as: " + this.osType);
    return this.osType;
  }
}
