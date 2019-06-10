
// TODO: Add TSLint dependency and use it over JSHint
// TODO: Add github pages publish to CI after typedoc works
// TODO: Add automatic testing of regex patterns.
import { exec, ExecException } from "child_process";
import { configure, getLogger, Logger } from 'log4js';


//TODO: Add doc comments to class
declare interface ChildProcessResult { error: ExecException | null; stdout: string; stderr: string; };
/**
 * @class Virtualbox
 * A node wrapper around the vboxmanage binary.
 */
export class Virtualbox {
  codes = {
    'ESCAPE'          : [0x01],
    'NUMBER_1'        : [0x02],
    'NUMBER_2'        : [0x03],
    'NUMBER_3'        : [0x04],
    'NUMBER_4'        : [0x05],
    'NUMBER_5'        : [0x06],
    'NUMBER_6'        : [0x07],
    'NUMBER_7'        : [0x08],
    'NUMBER_8'        : [0x09],
    'NUMBER_9'        : [0x0A],
    'NUMBER_0'        : [0x0B],
    'MINUS'           : [0x0C],
    'EQUAL'           : [0x0D],
    'BACKSPACE'       : [0x0E],
    'TAB'             : [0x0F],
  
    'Q'               : [0x10],
    'W'               : [0x11],
    'E'               : [0x12],
    'R'               : [0x13],
    'T'               : [0x14],
    'Y'               : [0x15],
    'U'               : [0x16],
    'I'               : [0x17],
    'O'               : [0x18],
    'P'               : [0x19],
    'LEFTBRACKET'     : [0x1A],
    'RIGHTBRACKET'    : [0x1B],
    'ENTER'           : [0x1C],
    'CTRL'            : [0x1D],
    'A'               : [0x1E],
    'S'               : [0x1F],
  
    'D'               : [0x20],
    'F'               : [0x21],
    'G'               : [0x22],
    'H'               : [0x23],
    'J'               : [0x24],
    'K'               : [0x25],
    'L'               : [0x26],
    'SEMICOLON'       : [0x27],
    'QUOTE'           : [0x28],
    'BACKQUOTE'       : [0x29],
    'SHIFT'           : [0x2A],
    'BACKSLASH'       : [0x2B],
    'Z'               : [0x2C],
    'X'               : [0x2D],
    'C'               : [0x2E],
    'V'               : [0x2F],
  
    'B'               : [0x30],
    'N'               : [0x31],
    'M'               : [0x32],
    'COMMA'           : [0x33],
    'PERIOD'          : [0x34],
    'SLASH'           : [0x35],
    'R_SHIFT'         : [0x36],
    'PRT_SC'          : [0x37],
    'ALT'             : [0x38],
    'SPACE'           : [0x39],
    'CAPS_LOCK'       : [0x3A],
    'F1'              : [0x3B],
    'F2'              : [0x3C],
    'F3'              : [0x3D],
    'F4'              : [0x3E],
    'F5'              : [0x3F],
  
    'F6'              : [0x40],
    'F7'              : [0x41],
    'F8'              : [0x42],
    'F9'              : [0x43],
    'F10'             : [0x44],
    'NUM_LOCK'        : [0x45], // May be [0x45, 0xC5],
    'SCROLL_LOCK'     : [0x46],
    'NUMPAD_7'        : [0x47],
    'NUMPAD_8'        : [0x48],
    'NUMPAD_9'        : [0x49],
    'NUMPAD_SUBTRACT' : [0x4A],
    'NUMPAD_4'        : [0x4B],
    'NUMPAD_5'        : [0x4C],
    'NUMPAD_6'        : [0x4D],
    'NUMPAD_ADD'      : [0x4E],
    'NUMPAD_1'        : [0x4F],
  
    'NUMPAD_2'        : [0x50],
    'NUMPAD_3'        : [0x51],
    'NUMPAD_0'        : [0x52],
    'NUMPAD_DECIMAL'  : [0x53],
    'F11'             : [0x57],
    'F12'             : [0x58],
  
    // Same as other Enter key
    // 'NUMBER_Enter'    : [0xE0, 0x1C],
    'R_CTRL'          : [0xE0, 0x1D],
  
    'NUMBER_DIVIDE'   : [0xE0, 0x35],
    //
    // 'NUMBER_*'        : [0xE0, 0x37],
    'R_ALT'           : [0xE0, 0x38],
  
    'HOME'            : [0xE0, 0x47],
    'UP'              : [0xE0, 0x48],
    'PAGE_UP'         : [0xE0, 0x49],
    'LEFT'            : [0xE0, 0x4B],
    'RIGHT'           : [0xE0, 0x4D],
    'END'             : [0xE0, 0x4F],
  
    'DOWN'            : [0xE0, 0x50],
    'PAGE_DOWN'       : [0xE0, 0x51],
    'INSERT'          : [0xE0, 0x52],
    'DELETE'          : [0xE0, 0x53],
    'WINDOW'          : [0xE0, 0x5B],
    'R_WINDOW'        : [0xE0, 0x5C],
    'MENU'            : [0xE0, 0x5D],
  
    'PAUSE'           : [0xE1, 0x1D, 0x45, 0xE1, 0x9D, 0xC5]
  };
  private REGEX = {
    WINDOWS: /^win/,
    MAC_OS: /^darwin/,
    LINUX: /^linux/,
    CARRIAGE_RETURN_LINE_FEED: /\r?\n/g,
    // "centos6" {64ec13bb-5889-4352-aee9-0f1c2a17923d}
    VBOX_E_INVALID_OBJECT_STATE: /VBOX_E_INVALID_OBJECT_STATE/,
    ESCAPED_QUOTE: /\"/,
    UUID_PARSE: /UUID\: ([a-f0-9\-]+)$/,
    DOUBLE_BACKSLASH: /\\/g
  };
  
  private osType: string;
  private hostPlatform: string;
  private vboxVersion: string;
  private vboxManageBinary: string;
  private _logging: Logger;
  get logging(): Logger {
    return this._logging;
  }
  private _executor: (command:string) => Promise<ChildProcessResult>;
  get executor(): (command:string) => Promise<ChildProcessResult> {
    return this._executor
  }
  set executor(executor: (command:string) => Promise<ChildProcessResult>) {
    this._executor = executor;
  }
  private knownOSTypes = {
    WINDOWS: "windows",
    MAC: "mac",
    LINUX: "linux"
  };

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  constructor(executor?: (command:string) => Promise<ChildProcessResult>) {
    configure({
      appenders: {
        out: {
          type: 'stdout',
          layout: {
            type: 'pattern',
            pattern: "%[[%d{yyyy-MM-dd hh:mm:ss.SSS}] [%p] %c - %]%m",
          }
        }
      },
      categories: { default: { appenders: ['out'], level: 'info' } }
    });
    
    this._logging = getLogger("VirtualBox");

    if (executor === undefined) {
      this.executor = (command: string): Promise<ChildProcessResult> => {
        return new Promise((resolve) => {
          exec(command, (error, stdout, stderr) => {
            resolve({ error, stdout, stderr });
          });
        });
      } 
    } else {
      this.executor = executor;
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
      var vBoxInstallPath =
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
  // TODO: Add catch block?
  private async setVersion(): Promise<void> {
    const result = await this._executor(this.vboxManageBinary + " --version");
    // e.g., "4.3.38r106717" or "5.0.20r106931"
    this.vboxVersion = result.stdout;
    this.logging.info("Virtualbox version detected as %s", this.vboxVersion);
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block?
  private async command(cmd: string): Promise<ChildProcessResult> {
    const result: ChildProcessResult = await this._executor(cmd);
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
  private async vboxcontrol(cmd): Promise<ChildProcessResult> {
    return await this.command("VBoxControl " + cmd);
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block?
  private async vboxmanage(cmd): Promise<ChildProcessResult> {
    const result = await this.command(this.vboxManageBinary + cmd);
    this.logging.debug;
    return result;
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async pause(vmname): Promise<ChildProcessResult> {
    this.logging.info('Pausing VM "%s"', vmname);
    return await this.vboxmanage('controlvm "' + vmname + '" pause');
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async list(): Promise<any> {
    this.logging.info("Listing VMs");
    const result = await this.vboxmanage('list "runningvms"');
    let stdOut = result[0];
    let stdErr = result[1];
    if (result[1] !== '') {
      throw result[1];
    }
    var _runningvms = this.parse_listdata(result[0]);
    const secondResult = await this.vboxmanage('list "vms"');
    var _all = this.parse_listdata(secondResult[0]);
    var _keys = Object.keys(_all);
    for (var _i = 0; _i < _keys.length; _i += 1) {
      var _key = _keys[_i];
      if (_runningvms[_key]) {
        _all[_key].running = true;
      } else {
        _all[_key].running = false;
      }
    }
    return _all;
  }


  private parse_listdata(raw_data): any {
    var _raw = raw_data.split(this.REGEX.CARRIAGE_RETURN_LINE_FEED);
    var _data = {};
    if (_raw.length > 0) {
      for (var _i = 0; _i < _raw.length; _i += 1) {
        var _line = _raw[_i];
        if (_line === "") {
          continue;
        }
        
        var arrMatches = _line.split(" ");
        // {'64ec13bb-5889-4352-aee9-0f1c2a17923d': 'centos6'}
        if (arrMatches && arrMatches.length === 2) {
          _data[arrMatches[1].toString()] = {
            name: arrMatches[0].toString()
          };
        }
      }
    }
    return _data;
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async reset(vmname): Promise<ChildProcessResult> {
    this.logging.info('Resetting VM "%s"', vmname);
    return await this.vboxmanage('controlvm "' + vmname + '" reset');
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async resume(vmname): Promise<ChildProcessResult> {
    this.logging.info('Resuming VM "%s"', vmname);
    return await this.vboxmanage('controlvm "' + vmname + '" resume');
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async start(vmname, use_gui): Promise<ChildProcessResult> {
    var start_opts = " --type ";
    if (typeof use_gui === "function") {
      use_gui = false;
    }
    start_opts += use_gui ? "gui" : "headless";

    this.logging.info('Starting VM "%s" with options: ', vmname, start_opts);

    const result = await this.vboxmanage(
      '-nologo startvm "' + vmname + '"' + start_opts
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
  public async stop(vmname): Promise<ChildProcessResult> {
    this.logging.info('Stopping VM "%s"', vmname);
    return await this.vboxmanage('controlvm "' + vmname + '" savestate');
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async savestate(vmname): Promise<ChildProcessResult> {
    this.logging.info('Saving State (alias to stop) VM "%s"', vmname);
    return await this.stop(vmname);
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async vmExport(vmname, output): Promise<ChildProcessResult> {
    this.logging.info('Exporting VM "%s"', vmname);
    return await this.vboxmanage(
      'export "' + vmname + '" --output "' + output + '"'
    );
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async poweroff(vmname): Promise<ChildProcessResult> {
    this.logging.info('Powering off VM "%s"', vmname);
    return await this.vboxmanage('controlvm "' + vmname + '" poweroff');
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async acpipowerbutton(vmname): Promise<ChildProcessResult> {
    this.logging.info('ACPI power button VM "%s"', vmname);
    const result = await this.vboxmanage('controlvm "' + vmname + '" acpipowerbutton');
    this.logging.debug(result);
    return result;
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async acpisleepbutton(vmname): Promise<ChildProcessResult> {
    this.logging.info('ACPI sleep button VM "%s"', vmname);
    return await this.vboxmanage(`controlvm ${vmname} acpisleepbutton`);
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async modify(vname, properties): Promise<ChildProcessResult> {
    this.logging.info("Modifying VM %s", vname);
    var args = [vname];

    for (var property in properties) {
      if (properties.hasOwnProperty(property)) {
        var value = properties[property];
        args.push("--" + property);

        if (Array.isArray(value)) {
          Array.prototype.push.apply(args, value);
        } else {
          args.push(value.toString());
        }
      }
    }

    var cmd =
      "modifyvm " +
      args
        .map(function(arg) {
          return '"' + arg + '"';
        })
        .join(" ");

    return await this.vboxmanage(cmd);
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async snapshotList(
    vmname
  ): Promise<{ snapshotList: any[]; currentSnapshot: any }> {
    this.logging.info('Listing snapshots for VM "%s"', vmname);
    const result = await this.vboxmanage(
      'snapshot "' + vmname + '" list --machinereadable'
    );

    this.logging.debug(result);

    if (result[1] !== '') {
      throw new Error(result[1]);
    }

    var s;
    var snapshots = new Array<any>();
    var currentSnapshot;
    var lines = (result[0] || "").split(require("os").EOL);
    let newObj = {};

    lines.forEach(function(line) {
      line
        .trim()
        .split("=")
        .forEach(function (l, k, v) {
          const key = `${v[0]}`;
          if ((k+1)%2 === 0) {
            newObj[key] = v[1].replace(/\"/g, "");
          }
        });
    });
    return { snapshotList: [newObj], currentSnapshot: newObj["CurrentSnapshotUUID"] };
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async snapshotTake(
    vmname,
    name,
    description = undefined,
    live = false
  ): Promise< string > {
    this.logging.info('Taking snapshot for VM "%s"', vmname);

    var cmd =
      "snapshot " + JSON.stringify(vmname) + " take " + JSON.stringify(name);

    if (description) {
      cmd += " --description " + JSON.stringify(description);
    }

    if (live === true) {
      cmd += " --live";
    }

    const result = await this.vboxmanage(cmd);
    var uuid;
    if (result.error) {
      throw new Error(`${result.error}`);
    }
    uuid = result.stdout.trim().replace(this.REGEX.UUID_PARSE, function(l, u) {
      return u;
    });
    return uuid;
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async snapshotDelete(vmname, uuid): Promise<ChildProcessResult> {
    this.logging.info('Deleting snapshot "%s" for VM "%s"', uuid, vmname);
    var cmd =
      "snapshot " + JSON.stringify(vmname) + " delete " + JSON.stringify(uuid);
    return await this.vboxmanage(cmd);
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async snapshotRestore(vmname, uuid): Promise<ChildProcessResult> {
    this.logging.info('Restoring snapshot "%s" for VM "%s"', uuid, vmname);
    var cmd =
      "snapshot " + JSON.stringify(vmname) + " restore " + JSON.stringify(uuid);
    return await this.vboxmanage(cmd);
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async isRunning(vmname): Promise<boolean> {
    var cmd = "list runningvms";
    const result = await this.vboxmanage(cmd);
    this.logging.info('Checking virtual machine "%s" is running or not', vmname);
    if (result.stdout.includes(vmname)) {
      return true;
    } else {
      return false;
    }
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async keyboardputscancode(vmname, codes): Promise<ChildProcessResult> {
    var codeStr = codes
      .map(function(code) {
        var s = code.toString(16);

        if (s.length === 1) {
          s = "0" + s;
        }
        return s;
      })
      .join(" ");
    this.logging.info('Sending VM "%s" keyboard scan codes "%s"', vmname, codeStr);
    return await this.vboxmanage(
      'controlvm "' + vmname + '" keyboardputscancode ' + codeStr
    );
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async vmExec(options): Promise<ChildProcessResult> {
    var vm = options.vm || options.name || options.vmname || options.title,
      username = options.user || options.username || "Guest",
      password = options.pass || options.passwd || options.password,
      path =
        options.path ||
        options.cmd ||
        options.command ||
        options.exec ||
        options.execute ||
        options.run,
      cmd,
      params = options.params || options.parameters || options.args;

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
      osType
    );

    return await this.vboxmanage(cmd);
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
      result = await this._executor(
        `${this.vboxManageBinary} showvminfo -machinereadable ${vmName}`
      );
    } catch (e) {
      this.logging.info("Could not showvminfo for %s", vmName);
    }

    if (result ||result.error) {
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

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async vmKill(options): Promise<ChildProcessResult> {
    let result;
    options = options || {};
    var vm = options.vm || options.name || options.vmname || options.title,
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
          vm: vm,
          user: options.user,
          password: options.password,
          path: "C:\\Windows\\System32\\taskkill.exe /im ",
          params: image_name
        });
      case this.knownOSTypes.MAC:
      case this.knownOSTypes.LINUX:
        result = await this.vmExec({
          vm: vm,
          user: options.user,
          password: options.password,
          path: "sudo killall ",
          params: image_name
        });
    }
    return result;
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async getGuestProperty(options): Promise< any > {
    var vm = options.vm || options.name || options.vmname || options.title,
      key = options.key,
      value = options.defaultValue || options.value;
    await this.getOSType(vm);
    const cmd = 'guestproperty get "' + vm + '" ' + key;
    const result = await this.vboxmanage(cmd);
    if (result.error) {
      throw result.error;
    }
    var retValue: (string | undefined) = result.stdout.substr(result.stdout.indexOf(":") + 1).trim();
    if (retValue === "No value set!") {
      retValue = undefined;
    }
    return retValue;
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async getExtraData(options): Promise< any > {
    var vm = options.vm || options.name || options.vmname || options.title,
      key = options.key,
      value = options.defaultValue || options.value;

    var cmd = 'getextradata "' + vm + '" "' + key + '"';
    const result = await this.vboxmanage(cmd);
    if (result[1]) {
      throw result[1];
    }
    var value = result[0].substr(result[0].indexOf(":") + 1).trim();
    if (value === "No value set!") {
      value = undefined;
    }
    return value;
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async setExtraData(options): Promise<ChildProcessResult> {
    var vm = options.vm || options.name || options.vmname || options.title,
      key = options.key,
      value = options.defaultValue || options.value;

    var cmd = 'setextradata "' + vm + '" "' + key + '" "' + value + '"';
    return await this.vboxmanage(cmd);
  }

  public getBreakCode(key) {
    var makeCode = this.codes[key],
      breakCode;
    if (makeCode === undefined) {
      throw new Error('Undefined key: ' + key);
    }
  
    if (key === 'PAUSE') {
      return [];
    }
  
    if (makeCode[0] === 0xE0) {
      return [ 0xE0, makeCode[1] + 0x80 ];
    } else {
      return [ makeCode[0] + 0x80 ];
    }
  };
}
