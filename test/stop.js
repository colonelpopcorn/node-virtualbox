"use strict";

//TODO: Move to mocha for automation
var nvbox = require('../dist/virtualbox'),
    args = process.argv.slice(2);

virtualbox.stop(args[0], function(error) {
  if(error) {
    throw error;
  }
});
