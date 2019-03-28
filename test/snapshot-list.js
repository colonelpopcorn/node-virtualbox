"use strict";

//TODO: Move to mocha for automation
var nvbox = require('../dist/virtualbox'),
    vm = process.argv.slice(2);

// TODO: Refactor with a promise
virtualbox.snapshotList(vm, function(error, snapshotList, currentSnapshotUUID) {
  if(error) {
    throw error;
  }

  if(snapshotList) {
    console.log(JSON.stringify(snapshotList), JSON.stringify(currentSnapshotUUID));
  }
});
