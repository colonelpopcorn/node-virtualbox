"use strict";

//TODO: Move to mocha for automation
var Virtualbox = require('../dist/virtualbox').Virtualbox,
    virtualbox = new Virtualbox(),
    args = process.argv.slice(2);

// TODO: Refactor with a promise
virtualbox.getExtraData({vm: args[0], key: args[1]}, function(error, value){
  if(error) {
    throw error;
  }

  console.log('Virtual Machine "%s" extra "%s" value is "%s"', args[0], args[1], value);
});
