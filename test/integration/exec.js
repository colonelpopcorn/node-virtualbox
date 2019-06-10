"use strict";

//TODO: Move to mocha for automation
var Virtualbox = require('../dist/virtualbox'),
    virtualbox = new Virtualbox(),
    args       = process.argv.slice(2),
    vm         = args[0],
    user       = args[1],
    pass       = args[2],
    ostype     = virtualbox.guestproperty.os(vm),
    path;

if (ostype === "windows") {
  path = "ping.exe";
} else if (ostype === "mac") {
  path = "ping";
} else {
  path = "ping";
}

// TODO: Refactor with a promise
virtualbox.start(vm, function(){
  virtualbox.exec({ 'vm': vm, 'user': user, 'passwd': pass, 'path': path, 'params': [args[1] || 'https://google.com'] }, function(error, stdout){
    if(error) {
      throw error;
    }
    console.log(stdout);
  });
});
