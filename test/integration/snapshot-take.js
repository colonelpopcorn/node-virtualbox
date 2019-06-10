"use strict";

//TODO: Move to mocha for automation
var nvbox = require('../dist/virtualbox'),
    vm = process.argv[2],
    name = process.argv[3];

// TODO: Refactor with a promise
virtualbox.snapshotTake(vm, name, function(error, uuid) {
  if(error) {
    throw error;
  }
  if(uuid) {
    console.log('UUID: ' + uuid);
  }
});