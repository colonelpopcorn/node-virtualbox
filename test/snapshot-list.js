"use strict";

var nvbox = require('../dist/virtualbox'),
    vm = process.argv.slice(2);

virtualbox.snapshotList(vm, function(error, snapshotList, currentSnapshotUUID) {
  if(error) {
    throw error;
  }

  if(snapshotList) {
    console.log(JSON.stringify(snapshotList), JSON.stringify(currentSnapshotUUID));
  }
});
