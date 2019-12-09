"use strict";

// TODO: Move to mocha for automation
var Virtualbox = require("../../dist/virtualbox").Virtualbox,
  virtualbox = new Virtualbox(),
  args = process.argv.slice(2);

// TODO: Refactor with a promise
virtualbox
  .stop(args[0])
  .then(val => {
    console.log(val);
  })
  .catch(error => {
    if (error) {
      throw error;
    }
  });
