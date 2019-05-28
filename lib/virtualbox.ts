'use strict';
// TODO: Add TSLint dependency and use it over JSHint
// TODO: Add typedoc dependency, get it working
// TODO: Add github pages publish to CI after typedoc works
// TODO: Add automatic testing of regex patterns.
import { exec, ChildProcess } from "mz/child_process";
import { logging } from "./logging";
import { REGEX } from "./regex";

//TODO: Add doc comments to class
export class Virtualbox {
  private osType: string;
  private hostPlatform: string;
  private vboxVersion: string;
  private vboxManageBinary: string;
  private _executor = exec;
  get executor(): Function {
    return this._executor
  }
  set executor(executor: Function) {
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
  constructor() {
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
    if (REGEX.WINDOWS.test(this.hostPlatform)) {
      // Path may not contain VBoxManage.exe but it provides this environment variable
      var vBoxInstallPath =
        process.env.VBOX_INSTALL_PATH || process.env.VBOX_MSI_INSTALL_PATH;
      vBoxManageBinary = '"' + vBoxInstallPath + "\\VBoxManage.exe" + '" ';
    } else if (
      REGEX.MAC_OS.test(this.hostPlatform) ||
      REGEX.LINUX.test(this.hostPlatform)
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
    this.vboxVersion = result[0];
    logging.info("Virtualbox version detected as %s", this.vboxVersion);
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block?
  private async command(cmd: string): Promise<ChildProcess> {
    const result: ChildProcess = await this._executor(cmd);
    if (
      result.stderr &&
      cmd.indexOf("pause") !== -1 &&
      cmd.indexOf("savestate") !== -1
    ) {
      throw new Error(result.error);
    }
    return result;
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block?
  private async vboxcontrol(cmd): Promise<ChildProcess> {
    return await this.command("VBoxControl " + cmd);
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block?
  private async vboxmanage(cmd): Promise<ChildProcess> {
    const result = await this.command(this.vboxManageBinary + cmd);
    logging.debug;
    return result;
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async pause(vmname): Promise<ChildProcess> {
    logging.info('Pausing VM "%s"', vmname);
    return await this.vboxmanage('controlvm "' + vmname + '" pause');
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async list(): Promise<any> {
    logging.info("Listing VMs");
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
    var _raw = raw_data.split(REGEX.CARRIAGE_RETURN_LINE_FEED);
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
  public async reset(vmname): Promise<ChildProcess> {
    logging.info('Resetting VM "%s"', vmname);
    return await this.vboxmanage('controlvm "' + vmname + '" reset');
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async resume(vmname): Promise<ChildProcess> {
    logging.info('Resuming VM "%s"', vmname);
    return await this.vboxmanage('controlvm "' + vmname + '" resume');
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async start(vmname, use_gui): Promise<ChildProcess> {
    var start_opts = " --type ";
    if (typeof use_gui === "function") {
      use_gui = false;
    }
    start_opts += use_gui ? "gui" : "headless";

    logging.info('Starting VM "%s" with options: ', vmname, start_opts);

    const result = await this.vboxmanage(
      '-nologo startvm "' + vmname + '"' + start_opts
    );
    if (
      result.error &&
      !(REGEX.VBOX_E_INVALID_OBJECT_STATE.test(result.error.message))
    ) {
      throw new Error(result.error);
    } else {
      return result;
    }
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async stop(vmname): Promise<ChildProcess> {
    logging.info('Stopping VM "%s"', vmname);
    return await this.vboxmanage('controlvm "' + vmname + '" savestate');
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async savestate(vmname): Promise<ChildProcess> {
    logging.info('Saving State (alias to stop) VM "%s"', vmname);
    return await this.stop(vmname);
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async vmExport(vmname, output): Promise<ChildProcess> {
    logging.info('Exporting VM "%s"', vmname);
    return await this.vboxmanage(
      'export "' + vmname + '" --output "' + output + '"'
    );
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async poweroff(vmname): Promise<ChildProcess> {
    logging.info('Powering off VM "%s"', vmname);
    return await this.vboxmanage('controlvm "' + vmname + '" poweroff');
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async acpipowerbutton(vmname): Promise<ChildProcess> {
    logging.info('ACPI power button VM "%s"', vmname);
    return await this.vboxmanage('controlvm "' + vmname + '" acpipowerbutton');
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async acpisleepbutton(vmname): Promise<ChildProcess> {
    logging.info('ACPI sleep button VM "%s"', vmname);
    return await this.vboxmanage('controlvm "' + vmname + '" acpisleepbutton');
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async modify(vname, properties): Promise<ChildProcess> {
    logging.info("Modifying VM %s", vname);
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
    logging.info('Listing snapshots for VM "%s"', vmname);
    const result = await this.vboxmanage(
      'snapshot "' + vmname + '" list --machinereadable'
    );

    logging.debug(result);

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
    logging.info('Taking snapshot for VM "%s"', vmname);

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
      throw new Error(result.error);
    }
    result.stdout.trim().replace(REGEX.UUID_PARSE, function(l, u) {
      uuid = u;
    });
    return uuid;
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async snapshotDelete(vmname, uuid): Promise<ChildProcess> {
    logging.info('Deleting snapshot "%s" for VM "%s"', uuid, vmname);
    var cmd =
      "snapshot " + JSON.stringify(vmname) + " delete " + JSON.stringify(uuid);
    return await this.vboxmanage(cmd);
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async snapshotRestore(vmname, uuid): Promise<ChildProcess> {
    logging.info('Restoring snapshot "%s" for VM "%s"', uuid, vmname);
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
    logging.info('Checking virtual machine "%s" is running or not', vmname);
    if (result.some(value => value.includes(vmname))) {
      return true;
    } else {
      return false;
    }
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async keyboardputscancode(vmname, codes): Promise<ChildProcess> {
    var codeStr = codes
      .map(function(code) {
        var s = code.toString(16);

        if (s.length === 1) {
          s = "0" + s;
        }
        return s;
      })
      .join(" ");
    logging.info('Sending VM "%s" keyboard scan codes "%s"', vmname, codeStr);
    return await this.vboxmanage(
      'controlvm "' + vmname + '" keyboardputscancode ' + codeStr
    );
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async vmExec(options): Promise<ChildProcess> {
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

    // FIXME: Shouldn't this be triple equals?
    if (this.vboxVersion == "5") {
      runcmd = " run ";
    }

    switch (osType) {
      case this.knownOSTypes.WINDOWS:
        path = path.replace(REGEX.DOUBLE_BACKSLASH, "\\\\");
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

    logging.info(
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
        this.vboxManageBinary + 'showvminfo -machinereadable "' + vmName + '"'
      );
    } catch (e) {
      logging.info("Could not showvminfo for %s", vmName);
    }

    if (result.error) {
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
    logging.debug("Detected guest OS as: " + this.osType);
    return this.osType;
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async vmKill(options): Promise<ChildProcess> {
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
        return await this.vmExec({
          vm: vm,
          user: options.user,
          password: options.password,
          path: "C:\\Windows\\System32\\taskkill.exe /im ",
          params: image_name
        });
      case this.knownOSTypes.MAC:
      case this.knownOSTypes.LINUX:
        return await this.vmExec({
          vm: vm,
          user: options.user,
          password: options.password,
          path: "sudo killall ",
          params: image_name
        });
    }
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
    var value = result.stdout.substr(result.stdout.indexOf(":") + 1).trim();
    if (value === "No value set!") {
      value = undefined;
    }
    return value;
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
    if (result.error) {
      throw result.error;
    }
    var value = result.stdout.substr(result.stdout.indexOf(":") + 1).trim();
    if (value === "No value set!") {
      value = undefined;
    }
    return value;
  }

  // TODO: Add doc comment
  // TODO: Write test
  // TODO: Add catch block
  public async setExtraData(options): Promise<ChildProcess> {
    var vm = options.vm || options.name || options.vmname || options.title,
      key = options.key,
      value = options.defaultValue || options.value;

    var cmd = 'setextradata "' + vm + '" "' + key + '" "' + value + '"';
    return await this.vboxmanage(cmd);
  }
}
