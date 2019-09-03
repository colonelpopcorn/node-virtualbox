Vagrant.configure("2") do |config|
  3.times do |id|
    machine_name = "test-machine-#{id+1}"
    config.vm.define machine_name do |machine|
      config.vm.box = "ubuntu/xenial64"
      machine.vm.hostname = machine_name
      machine.vm.provider "virtualbox" do |vbox|
        vbox.name = machine_name
      end
    end
  end
end
