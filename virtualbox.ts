
// TODO: Add github pages publish to CI after typedoc works
// TODO: Add automatic testing of regex patterns.
import { exec, ExecException } from "child_process";
import { configure, getLogger, Logger } from "log4js";

// TODO: Add doc comments to class
declare interface IChildProcessResult { error: ExecException | null; stdout: string; stderr: string; }
/**
 * Virtualbox
 * A node wrapper around the vboxmanage binary.
 */
export class Virtualbox {
  get Logging(): Logger {
    return this.logging;
  }
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
        return new Promise((resolve) => {
          exec(command, (error, stdout, stderr) => {
            resolve({ error, stdout, stderr });
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

  // TODO: Add doc comment
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

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async pause(vmname): Promise<IChildProcessResult> {
    this.Logging.info('Pausing VM "%s"', vmname);
    return await this.vboxmanage('controlvm "' + vmname + '" pause');
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async list(): Promise<any> {
    this.Logging.info("Listing VMs");
    const result = await this.vboxmanage('list "runningvms"');
    const stdOut = result[0];
    const stdErr = result[1];
    if (result[1] !== "") {
      throw result[1];
    }
    const runningVms = this.parse_listdata(result[0]);
    const secondResult = await this.vboxmanage('list "vms"');
    const all = this.parse_listdata(secondResult[0]);
    const keys = Object.keys(all);
    for (const key of keys) {
      if (runningVms[key]) {
        all[key].running = true;
      } else {
        all[key].running = false;
      }
    }
    return all;
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async reset(vmname): Promise<IChildProcessResult> {
    this.Logging.info('Resetting VM "%s"', vmname);
    return await this.vboxmanage('controlvm "' + vmname + '" reset');
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async resume(vmname): Promise<IChildProcessResult> {
    this.Logging.info('Resuming VM "%s"', vmname);
    return await this.vboxmanage('controlvm "' + vmname + '" resume');
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async start(vmname, useGui): Promise<IChildProcessResult> {
    let startOpts = " --type ";
    if (typeof useGui === "function") {
      useGui = false;
    }
    startOpts += useGui ? "gui" : "headless";

    this.Logging.info('Starting VM "%s" with options: ', vmname, startOpts);

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

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async stop(vmname): Promise<IChildProcessResult> {
    this.Logging.info('Stopping VM "%s"', vmname);
    return await this.vboxmanage('controlvm "' + vmname + '" savestate');
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async savestate(vmname): Promise<IChildProcessResult> {
    this.Logging.info('Saving State (alias to stop) VM "%s"', vmname);
    return await this.stop(vmname);
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async vmExport(vmname, output): Promise<IChildProcessResult> {
    this.Logging.info('Exporting VM "%s"', vmname);
    return await this.vboxmanage(
      'export "' + vmname + '" --output "' + output + '"',
    );
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async poweroff(vmname): Promise<IChildProcessResult> {
    this.Logging.info('Powering off VM "%s"', vmname);
    return await this.vboxmanage('controlvm "' + vmname + '" poweroff');
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async acpipowerbutton(vmname): Promise<IChildProcessResult> {
    this.Logging.info('ACPI power button VM "%s"', vmname);
    const result = await this.vboxmanage('controlvm "' + vmname + '" acpipowerbutton');
    this.Logging.debug(result);
    return result;
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async acpisleepbutton(vmname): Promise<IChildProcessResult> {
    this.Logging.info('ACPI sleep button VM "%s"', vmname);
    return await this.vboxmanage(`controlvm ${vmname} acpisleepbutton`);
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async modify(vname, properties): Promise<IChildProcessResult> {
    this.Logging.info("Modifying VM %s", vname);
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

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async snapshotList(
    vmname,
  ): Promise<{ snapshotList: any[]; currentSnapshot: any }> {
    this.Logging.info('Listing snapshots for VM "%s"', vmname);
    const result = await this.vboxmanage(
      'snapshot "' + vmname + '" list --machinereadable',
    );

    this.Logging.debug(result);

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

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async snapshotTake(
    vmname,
    name,
    description?,
    live = false,
  ): Promise< string > {
    this.Logging.info('Taking snapshot for VM "%s"', vmname);

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

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async snapshotDelete(vmname, uuid): Promise<IChildProcessResult> {
    this.Logging.info('Deleting snapshot "%s" for VM "%s"', uuid, vmname);
    const cmd =
      "snapshot " + JSON.stringify(vmname) + " delete " + JSON.stringify(uuid);
    return await this.vboxmanage(cmd);
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async snapshotRestore(vmname, uuid): Promise<IChildProcessResult> {
    this.Logging.info('Restoring snapshot "%s" for VM "%s"', uuid, vmname);
    const cmd =
      "snapshot " + JSON.stringify(vmname) + " restore " + JSON.stringify(uuid);
    return await this.vboxmanage(cmd);
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async isRunning(vmname): Promise<boolean> {
    const cmd = "list runningvms";
    const result = await this.vboxmanage(cmd);
    this.Logging.info('Checking virtual machine "%s" is running or not', vmname);
    if (result.stdout.includes(vmname)) {
      return true;
    } else {
      return false;
    }
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async keyboardputscancode(vmname, codes): Promise<IChildProcessResult> {
    const codeStr = codes
      .map((code) => {
        let s = code.toString(16);

        if (s.length === 1) {
          s = "0" + s;
        }
        return s;
      })
      .join(" ");
    this.Logging.info('Sending VM "%s" keyboard scan codes "%s"', vmname, codeStr);
    return await this.vboxmanage(
      'controlvm "' + vmname + '" keyboardputscancode ' + codeStr,
    );
  }

  // TODO: Add doc comment
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

    this.Logging.info(
      'Executing command "vboxmanage %s" on VM "%s" detected OS type "%s"',
      cmd,
      vm,
      osType,
    );

    return await this.vboxmanage(cmd);
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async vmKill(options): Promise<IChildProcessResult> {
    let result;
    options = options || {};
    const vm = options.vm || options.name || options.vmname || options.title,
      path =
        options.path ||
        options.cmd ||
        options.command ||
        options.exec ||
        options.execute ||
        options.run,
      image_name = options.image_name || path,
      cmd = 'guestcontrol "' + vm + '" process kill';

    await this.getOSType(vm);
    switch (this.osType) {
      case this.knownOSTypes.WINDOWS:
        result = await this.vmExec({
          vm,
          user: options.user,
          password: options.password,
          path: "C:\\Windows\\System32\\taskkill.exe /im ",
          params: image_name,
        });
      case this.knownOSTypes.MAC:
      case this.knownOSTypes.LINUX:
        result = await this.vmExec({
          vm,
          user: options.user,
          password: options.password,
          path: "sudo killall ",
          params: image_name,
        });
    }
    return result;
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async getGuestProperty(options): Promise< any > {
    const vm = options.vm || options.name || options.vmname || options.title,
      key = options.key,
      value = options.defaultValue || options.value;
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

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async getExtraData(options): Promise< any > {
    const vm = options.vm || options.name || options.vmname || options.title,
      key = options.key,
      value = options.defaultValue || options.value;

    const cmd = 'getextradata "' + vm + '" "' + key + '"';
    const result = await this.vboxmanage(cmd);
    if (result[1]) {
      throw result[1];
    }
    let value = result[0].substr(result[0].indexOf(":") + 1).trim();
    if (value === "No value set!") {
      value = undefined;
    }
    return value;
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async setExtraData(options): Promise<IChildProcessResult> {
    const vm = options.vm || options.name || options.vmname || options.title,
      key = options.key,
      value = options.defaultValue || options.value;

    const cmd = 'setextradata "' + vm + '" "' + key + '" "' + value + '"';
    return await this.vboxmanage(cmd);
  }

  public getBreakCode(key) {
    let makeCode = this.codes[key],
      breakCode;
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
  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block?
  private async setVersion(): Promise<void> {
    const result = await this.Executor(this.vboxManageBinary + " --version");
    // e.g., "4.3.38r106717" or "5.0.20r106931"
    this.vboxVersion = result.stdout;
    this.Logging.info("Virtualbox version detected as %s", this.vboxVersion);
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block?
  private async command(cmd: string): Promise<IChildProcessResult> {
    const result: IChildProcessResult = await this.Executor(cmd);
    if (
      result.error &&
      cmd.indexOf("pause") !== -1 &&
      cmd.indexOf("savestate") !== -1
    ) {
      throw new Error(`${result.error}`);
    }
    return result;
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block?
  private async vboxcontrol(cmd): Promise<IChildProcessResult> {
    return await this.command("VBoxControl " + cmd);
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block?
  private async vboxmanage(cmd): Promise<IChildProcessResult> {
    const result = await this.command(this.vboxManageBinary + cmd);
    this.Logging.debug;
    return result;
  }

  private parse_listdata(raw_data): any {
    const _raw = raw_data.split(this.REGEX.CARRIAGE_RETURN_LINE_FEED);
    const _data = {};
    if (_raw.length > 0) {
      for (let _i = 0; _i < _raw.length; _i += 1) {
        const _line = _raw[_i];
        if (_line === "") {
          continue;
        }

        const arrMatches = _line.split(" ");
        // {'64ec13bb-5889-4352-aee9-0f1c2a17923d': 'centos6'}
        if (arrMatches && arrMatches.length === 2) {
          _data[arrMatches[1].toString()] = {
            name: arrMatches[0].toString(),
          };
        }
      }
    }
    return _data;
  }

  // TODO: Add doc comment
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
      this.Logging.info("Could not showvminfo for %s", vmName);
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
    this.Logging.debug("Detected guest OS as: " + this.osType);
    return this.osType;
  }
}
