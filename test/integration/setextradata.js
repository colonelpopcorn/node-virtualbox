"use strict";

//TODO: Move to mocha for automation
var nvbox = require('../dist/virtualbox'),
    args = process.argv.slice(2);

// TODO: Refactor with a promise
virtualbox.extradata.set({vm: args[0], key: args[1], value: args[2]}, function(error, value){
  if(error) {
    throw error;
  }

  console.log('Set Virtual Machine "%s" extra "%s" value to "%s"', args[0], args[1], args[2]);
});