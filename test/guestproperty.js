"use strict";

//TODO: Move to mocha for automation
var nvbox = require('../dist/virtualbox'),
    args = process.argv.slice(2);

// TODO: Refactor with a promise
virtualbox.guestproperty.get(args[0], args[1], function(error){
  if(error) {
    throw error;
  }
});
