import { exec, ChildProcess } from "mz/child_process";
import { logging } from "./logging";

export class Virtualbox {
  private osType: string;
  private hostPlatform: string;
  private vboxVersion: string;
  private vboxManagePath: string;
  private vboxManageBinary: string;
  private knownOSTypes = {
    WINDOWS: "windows",
    MAC: "mac",
    LINUX: "linux"
  };

  constructor() {
    this.setVboxManageBinary();
    this.setVersion();
    this.hostPlatform = process.platform;
  }

  private setVboxManageBinary(): void {
    let vBoxManageBinary;
    // Host operating system
    if (/^win/.test(this.hostPlatform)) {
      // Path may not contain VBoxManage.exe but it provides this environment variable
      var vBoxInstallPath =
        process.env.VBOX_INSTALL_PATH || process.env.VBOX_MSI_INSTALL_PATH;
      vBoxManageBinary = '"' + vBoxInstallPath + "\\VBoxManage.exe" + '" ';
    } else if (
      /^darwin/.test(this.hostPlatform) ||
      /^linux/.test(this.hostPlatform)
    ) {
      // Mac OS X and most Linux use the same binary name, in the path
      vBoxManageBinary = "vboxmanage ";
    } else {
      // Otherwise (e.g., SunOS) hope it's in the path
      vBoxManageBinary = "vboxmanage ";
    }
    this.vboxManageBinary = vBoxManageBinary;
  }

  private async setVersion(): Promise<void> {
    const result = await exec(this.vboxManageBinary + " --version");
    // e.g., "4.3.38r106717" or "5.0.20r106931"
    this.vboxVersion = result.stdout.split(".")[0];
    logging.info("Virtualbox version detected as %s", this.vboxVersion);
  }

  private async command(cmd: string): Promise<ChildProcess> {
    const result: ChildProcess = await exec(cmd);
    if (
      result.stderr &&
      cmd.indexOf("pause") !== -1 &&
      cmd.indexOf("savestate") !== -1
    ) {
      throw new Error(result);
    }
    return result;
  }

  private async vboxcontrol(cmd): Promise<ChildProcess> {
    return this.command("VBoxControl " + cmd);
  }

  private async vboxmanage(cmd) {
    return this.command(this.vboxManageBinary + cmd);
  }

  public async pause(vmname) {
    logging.info('Pausing VM "%s"', vmname);
    const result = await this.vboxmanage('controlvm "' + vmname + '" pause');
    if (result.error) {
      throw new Error(result.error);
    }
  }

  public async list() {
    logging.info("Listing VMs");
    const result = await this.vboxmanage('list "runningvms"');
    var _runningvms = this.parse_listdata(result.stdout);
    const secondResult = await this.vboxmanage('list "vms"');
    var _all = this.parse_listdata(secondResult.stdout);
    var _keys = Object.keys(_all);
    for (var _i = 0; _i < _keys.length; _i += 1) {
      var _key = _keys[_i];
      if (_runningvms[_key]) {
        _all[_key].running = true;
      } else {
        _all[_key].running = false;
      }
    }
  }

  private parse_listdata(raw_data) {
    var _raw = raw_data.split(/\r?\n/g);
    var _data = {};
    if (_raw.length > 0) {
      for (var _i = 0; _i < _raw.length; _i += 1) {
        var _line = _raw[_i];
        if (_line === "") {
          continue;
        }
        // "centos6" {64ec13bb-5889-4352-aee9-0f1c2a17923d}
        var rePattern = /^"(.+)" \{(.+)\}$/;
        var arrMatches = _line.match(rePattern);
        // {'64ec13bb-5889-4352-aee9-0f1c2a17923d': 'centos6'}
        if (arrMatches && arrMatches.length === 3) {
          _data[arrMatches[2].toString()] = {
            name: arrMatches[1].toString()
          };
        }
      }
    }
    return _data;
  }

  public async reset(vmname) {
    logging.info('Resetting VM "%s"', vmname);
    const result = await this.vboxmanage('controlvm "' + vmname + '" reset');
    if (result.error) {
      throw new Error(result.error);
    }
  }

  public async resume(vmname, callback) {
    logging.info('Resuming VM "%s"', vmname);
    const result = await this.vboxmanage('controlvm "' + vmname + '" resume');
    if (result.error) {
      throw new Error(result.error);
    }
  }

  public async start(vmname, use_gui) {
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
      !/VBOX_E_INVALID_OBJECT_STATE/.test(result.error.message)
    ) {
      throw new Error(result.error);
    }
  }

  public async stop(vmname) {
    logging.info('Stopping VM "%s"', vmname);
    const result = await this.vboxmanage(
      'controlvm "' + vmname + '" savestate'
    );
    if (result.error) {
      throw new Error(result.error);
    }
  }

  public async savestate(vmname) {
    logging.info('Saving State (alias to stop) VM "%s"', vmname);
    await this.stop(vmname);
  }

  public async vmExport(vmname, output) {
    logging.info('Exporting VM "%s"', vmname);
    const result = await this.vboxmanage(
      'export "' + vmname + '" --output "' + output + '"'
    );
    if (result.error) {
      throw new Error(result.error);
    }
  }

  public async poweroff(vmname) {
    logging.info('Powering off VM "%s"', vmname);
    const result = await this.vboxmanage('controlvm "' + vmname + '" poweroff');
    if (result.error) {
      throw new Error(result.error);
    }
  }

  public async acpipowerbutton(vmname) {
    logging.info('ACPI power button VM "%s"', vmname);
    const result = await this.vboxmanage(
      'controlvm "' + vmname + '" acpipowerbutton'
    );
    if (result.error) {
      throw new Error(result.error);
    }
  }

  public async acpisleepbutton(vmname) {
    logging.info('ACPI sleep button VM "%s"', vmname);
    const result = await this.vboxmanage(
      'controlvm "' + vmname + '" acpisleepbutton'
    );
    if (result.error) {
      throw new Error(result.error);
    }
  }

  public async modify(vname, properties, callback) {
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

    const result = await this.vboxmanage(cmd);
    if (result.error) {
      throw new Error(result.error);
    }
  }

  public async snapshotList(vmname, callback) {
    logging.info('Listing snapshots for VM "%s"', vmname);
    const result = await this.vboxmanage(
      'snapshot "' + vmname + '" list --machinereadable'
    );

    if (result.error) {
      throw new Error(result.error);
    }

    var s;
    var snapshots = [];
    var currentSnapshot;
    var lines = (result.stdout || "").split(require("os").EOL);

    lines.forEach(function(line) {
      // TODO: Refactor and test regex, see issue #53
      line
        .trim()
        .replace(
          /^(CurrentSnapshotUUID|SnapshotName|SnapshotUUID).*\="(.*)"$/,
          function(l, k, v) {
            if (k === "CurrentSnapshotUUID") {
              currentSnapshot = v;
            } else if (k === "SnapshotName") {
              s = {
                name: v
              };
              snapshots.push(s);
            } else {
              s.uuid = v;
            }
          }
        );
    });
  }

  public async snapshotTake(
    vmname,
    name,
    /*optional*/ description = undefined,
    live = false
  ) {
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
    result.stdout.trim().replace(/UUID\: ([a-f0-9\-]+)$/, function(l, u) {
      uuid = u;
    });
    return uuid;
  }

  public async snapshotDelete(vmname, uuid) {
    logging.info('Deleting snapshot "%s" for VM "%s"', uuid, vmname);
    var cmd =
      "snapshot " + JSON.stringify(vmname) + " delete " + JSON.stringify(uuid);
    const result = await this.vboxmanage(cmd);
    if (result.error) {
      throw new Error(result.error);
    }
  }

  public async snapshotRestore(vmname, uuid) {
    logging.info('Restoring snapshot "%s" for VM "%s"', uuid, vmname);
    var cmd =
      "snapshot " + JSON.stringify(vmname) + " restore " + JSON.stringify(uuid);
    const result = await this.vboxmanage(cmd);
    if (result.error) {
      throw new Error(result.error);
    }
  }

  public async isRunning(vmname): Promise<boolean> {
    var cmd = "list runningvms";
    const result = await this.vboxmanage(cmd);
    logging.info('Checking virtual machine "%s" is running or not', vmname);
    if (result.stdout.indexOf(vmname) === -1) {
      return false;
    } else {
      return true;
    }
  }

  public async keyboardputscancode(vmname, codes) {
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
    const result = await this.vboxmanage(
      'controlvm "' + vmname + '" keyboardputscancode ' + codeStr
    );
    if (result.error) {
      throw new Error(result.error);
    } else {
      return result.stdout;
    }
  }

  public async vmExec(options) {
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
        path = path.replace(/\\/g, "\\\\");
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

  private async getOSType(vmName) {
    if (this.osType) {
      return this.osType;
    }

    let result;
    try {
      result = await exec(
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

  public async vmKill(options, callback) {
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

  public async getGuestProperty(options) {
    var vm = options.vm || options.name || options.vmname || options.title,
      key = options.key,
      value = options.defaultValue || options.value;
    await this.getOSType(vm);
    const cmd = 'guestproperty get "' + vm + '" ' + key;
    const result = await this.vboxmanage(cmd);
    if (result.error) {
      throw result.error;
    }
    var value = result.stdout.substr(result.stdout.indexOf(':') + 1).trim();
    if (value === 'No value set!') {
      value = undefined;
    }
    return value;
  }
  
  //TODO: Add extra data get and set.
  public async getExtraData(options) {
    var vm = options.vm || options.name || options.vmname || options.title,
      key = options.key,
      value = options.defaultValue || options.value;

    var cmd = 'getextradata "' + vm + '" "' + key + '"';
    const result = await this.vboxmanage(cmd);
    if (result.error) {
      throw result.error;
    }
    var value = result.stdout.substr(result.stdout.indexOf(':') + 1).trim();
    if (value === 'No value set!') {
      value = undefined;
    }
    return value;
  }

  public async setExtraData(options) {
    var vm = options.vm || options.name || options.vmname || options.title,
      key = options.key,
      value = options.defaultValue || options.value;

    var cmd = 'setextradata "' + vm + '" "' + key + '" "' + value + '"';
    return await this.vboxmanage(cmd);
  }
}

