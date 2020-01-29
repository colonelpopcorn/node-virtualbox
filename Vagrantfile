Vagrant.configure("2") do |config|
  tests = [
    'acpisleepbutton',
    'exec',
    'extradata-guestproperty',
    'keyboardputscancode',
    'modify',
    'pause-resume-poweroff-reset',
    'snapshots',
    'turnOffAndExport'
  ]
  tests.each do |machine_id|
    machine_name = machine_id
    config.vm.define machine_name do |machine|
      config.vm.box = "generic/alpine310"
      machine.vm.hostname = machine_name
      machine.vm.provider "virtualbox" do |vbox|
        vbox.name = machine_name
        vbox.memory = 128
        vbox.cpus = 1
      end
    end
  end
end
