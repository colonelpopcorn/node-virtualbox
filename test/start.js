"use strict";

//TODO: Move to mocha for automation
var nvbox = require('../dist/virtualbox'),
    args = process.argv.slice(2);

// TODO: Refactor with a promise
virtualbox.start(args[0], function(error){
  if(error) {
    throw error;
  }
});
