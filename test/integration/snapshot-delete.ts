"use strict";

// TODO: Move to mocha for automation
var nvbox = require("../dist/virtualbox"),
  vm = process.argv[2],
  uuid = process.argv[3];

// TODO: Refactor with a promise
virtualbox.snapshotDelete(vm, uuid, function(error) {
  if (error) {
    throw error;
  }
});
