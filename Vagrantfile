Vagrant.configure("2") do |config|
  3.times do |id|
    machine_name = "test-machine-#{id+1}"
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
