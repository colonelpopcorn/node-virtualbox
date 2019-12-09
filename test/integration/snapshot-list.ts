"use strict";

// TODO: Move to mocha for automation
var Virtualbox = require("../dist/lib/virtualbox").Virtualbox,
  virtualbox = new Virtualbox(),
  vm = process.argv.slice(2);

// TODO: Refactor with a promise
virtualbox
  .snapshotList(vm)
  .then(function({ snapshotList, currentSnapshot }) {
    if (snapshotList) {
      console.log(
        JSON.stringify(snapshotList),
        JSON.stringify(currentSnapshot)
      );
    }
  })
  .catch(error => {
    if (error) {
      throw error;
    }
  });
