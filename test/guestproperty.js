"use strict";

var virtualbox = require('../dist/virtualbox'),
    args = process.argv.slice(2);

virtualbox.guestproperty.get(args[0], args[1], function(error){
  if(error) {
    throw error;
  }
});
