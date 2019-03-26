"use strict";

var virtualbox = require('../dist/virtualbox'),
    args = process.argv.slice(2);

virtualbox.resume(args[0], function(error){
  if(error) {
    throw error;
  }
});
