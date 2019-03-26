"use strict";

var nvbox = require('../dist/virtualbox'),
    args = process.argv.slice(2);

virtualbox.pause(args[0], function(error){
  if(error) {
    throw error;
  }
});
