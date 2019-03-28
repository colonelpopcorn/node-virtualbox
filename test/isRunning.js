"use strict";

//TODO: Move to mocha for automation
var Virtualbox = require('../dist/virtualbox').Virtualbox,
    virtualbox = new Virtualbox(),
    vm = process.argv[2];

virtualbox.isRunning(vm).then(value => {
  if (value) {
    console.log('Virtual Machine "%s" is Running', vm);
  } else {
    console.log('Virtual Machine "%s" is Poweroff', vm);
  }
});
  
