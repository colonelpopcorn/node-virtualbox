"use strict";

//TODO: Move to mocha for automation
var Virtualbox = require('../dist/virtualbox').Virtualbox,
    virtualbox = new Virtualbox(),
    args = process.argv.slice(2);

// TODO: Refactor with a promise
virtualbox.export(args[0], args[1], function(error){
  if(error) {
    throw error;
  }
});
